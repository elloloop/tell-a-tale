import StoryEditor from '@/components/StoryEditor';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold text-center mb-8">
        Tell a Tale
      </h1>
      <StoryEditor />
    </div>
  );
}
