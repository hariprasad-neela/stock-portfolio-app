// Helper to format ISO Date to Readable Indian Format
export const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};
