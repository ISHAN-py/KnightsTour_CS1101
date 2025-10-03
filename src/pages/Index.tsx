import { MadeWithDyad } from "@/components/made-with-dyad";
import Board from "@/components/Board"; // Import the new Board component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Board /> {/* Render the Board component */}
      <MadeWithDyad />
    </div>
  );
};

export default Index;