'use client';

import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function CustomUserButton() {
  const [isClerkReady, setIsClerkReady] = useState(false);

  useEffect(() => {
    // Check if Clerk is configured (only runs on client side)
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setIsClerkReady(!!key && key.length > 20 && !key.includes('...'));
  }, []);

  if (!isClerkReady) {
    return null;
  }

  return (
    <UserButton 
      appearance={{
        elements: {
          avatarBox: "w-10 h-10 rounded-xl",
          userButtonPopoverCard: "rounded-2xl shadow-xl",
          userButtonPopoverActionButton: "hover:bg-gray-50 rounded-lg",
        }
      }}
      afterSignOutUrl="/"
    />
  );
}
