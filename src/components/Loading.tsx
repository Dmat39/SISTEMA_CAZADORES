interface LoadingProps {
  message?: string;
}

const Loading = ({ message }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-gray-500 dark:text-gray-400">
      <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin shrink-0" />
      {message && <span className="text-sm font-medium">{message} . . .</span>}
    </div>
  );
};

export default Loading;
