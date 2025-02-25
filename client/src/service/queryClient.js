import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create a QueryClient instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 1, // Cache remains fresh for 1 minutes
            cacheTime: 1000 * 60 * 30, // Data is removed after 30 minutes
            retry: 2, // Retry failed requests 2 times
        },
    },
});

// Create a persister using localStorage
const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

// Enable persistence
persistQueryClient({
    queryClient,
    persister,
});
