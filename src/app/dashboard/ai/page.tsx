import AIChatPanel from '@/components/ai/AIChatPanel';

export const dynamic = 'force-dynamic';

export default function AIPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <AIChatPanel showContext />
    </div>
  );
}
