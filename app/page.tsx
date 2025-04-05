import TodoLists from "./components/TodoLists";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container mx-auto px-4">
        <TodoLists />
      </main>
    </div>
  );
} 