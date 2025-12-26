export const executeBatchCreation = async (
  transactionIds: string[], 
  portfolioId: string, 
  name?: string
) => {
  const response = await fetch('/api/batches/create-selective', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      batch_name: name,
      transaction_ids: transactionIds,
      portfolio_id: portfolioId
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Batch creation failed');
  }

  return response.json();
};