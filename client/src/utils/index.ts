// Helper to format ISO Date to Readable Indian Format
export const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// Helper to format number to Indian Rupee format
export const formatRupee = (amount: number | null | undefined) => {
    // Handle null, undefined, NaN, or 0 inputs
    if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
        return '₹0.00';
    }
    
    // Round to 2 decimal places to ensure precision
    const roundedAmount = Math.round(amount * 100) / 100;
    
    // Format using Indian locale with 2 decimal places
    return roundedAmount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
