'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Example component showing how to use Clerk authentication
 * in client components throughout the app.
 * 
 * This can be used in any client component to:
 * - Get current user information
 * - Check loading state
 * - Handle unauthenticated users
 */
export function ProfileCard() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  // Handle not signed in
  if (!isSignedIn || !user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }
  
  // Render user info
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        {user.imageUrl && (
          <img 
            src={user.imageUrl} 
            alt={user.fullName || 'User'} 
            className="w-16 h-16 rounded-xl"
          />
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">User ID:</span>
          <span className="font-mono text-xs">{user.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Member since:</span>
          <span>
            {user.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Simple username display
 */
export function UserGreeting() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user.firstName}! 👋
      </h1>
    </div>
  );
}
