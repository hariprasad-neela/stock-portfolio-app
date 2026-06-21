import pool from '../db.js';

export const getCandles = async (req, res) => {
  const { page = 1, limit = 10, ticker } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Base WHERE clause logic (Standardizing to reuse for list and summary)
    let whereClause = " WHERE 1=1";
    const params = [];
    if (ticker) {
      params.push(`%${ticker}%`);
      whereClause += ` AND batch_name ILIKE $${params.length}`;
    }

    // 2. The Comprehensive Query
    // We use a CTE (Common Table Expression) to get global stats once
    // and then select the paginated rows.
    const query = `
      WITH filtered_batches AS (
          SELECT * FROM batches ${whereClause}
      ),
      summary_stats AS (
          SELECT 
              COUNT(*) as global_count,
              SUM(profit) as global_profit,
              SUM(total_units) as global_units
          FROM filtered_batches
      )
      SELECT 
          fb.*, 
          ss.global_count, 
          ss.global_profit, 
          ss.global_units
      FROM filtered_batches fb
      CROSS JOIN summary_stats ss
      ORDER BY batch_date DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // Add pagination params to the array
    const queryParams = [...params, parseInt(limit), parseInt(offset)];
    const result = await pool.query(query, queryParams);

    // 3. Extracting Global Data from the first row (if exists)
    const firstRow = result.rows[0];
    const totalRecords = firstRow ? parseInt(firstRow.global_count) : 0;
    const globalSummary = {
      totalProfit: firstRow ? parseFloat(firstRow.global_profit || 0) : 0,
      totalUnits: firstRow ? parseInt(firstRow.global_units || 0) : 0,
      totalBatches: totalRecords
    };

    res.json({
      data: result.rows.map(({ global_count, global_profit, global_units, ...row }) => row),
      summary: globalSummary,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error in getBatches:", err);
    res.status(500).json({ error: err.message });
  }
};
