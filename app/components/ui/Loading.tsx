interface LoadingProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loading({ 
  title = "Loading...", 
  description,
  size = "md" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className="text-center">
      <div className={`animate-spin ${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4`} />
      <h2 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">{title}</h2>
      {description && (
        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );
}