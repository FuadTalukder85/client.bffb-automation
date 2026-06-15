import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  return (
    <div>
      <ThemeToggle />

      <div className="p-4 bg-red-400 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ERP Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome to your management system.
        </p>
      </div>
    </div>
  );
}

export default App;
