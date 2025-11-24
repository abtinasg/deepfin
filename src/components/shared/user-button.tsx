'use client';

import { UserButton } from '@clerk/nextjs';

export function CustomUserButton() {
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
