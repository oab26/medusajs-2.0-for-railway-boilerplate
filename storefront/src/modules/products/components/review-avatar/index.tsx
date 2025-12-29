import clsx from "clsx"

type ReviewAvatarProps = {
  firstName: string
  lastName: string
  verified?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
}

const verifiedBadgeSizes = {
  sm: "w-3 h-3 -bottom-0.5 -right-0.5",
  md: "w-4 h-4 -bottom-0.5 -right-0.5",
  lg: "w-5 h-5 -bottom-1 -right-1",
}

function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ""
  const last = lastName?.charAt(0)?.toUpperCase() || ""
  return first + last || "?"
}

function getBackgroundColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
    "bg-rose-100 text-rose-700",
  ]

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function ReviewAvatar({
  firstName,
  lastName,
  verified = false,
  size = "md",
  className,
}: ReviewAvatarProps) {
  const initials = getInitials(firstName, lastName)
  const colorClass = getBackgroundColor(firstName + lastName)

  return (
    <div className={clsx("relative inline-flex", className)}>
      <div
        className={clsx(
          "rounded-full flex items-center justify-center font-medium",
          sizeClasses[size],
          colorClass
        )}
      >
        {initials}
      </div>
      {verified && (
        <div
          className={clsx(
            "absolute bg-blue-500 rounded-full flex items-center justify-center",
            verifiedBadgeSizes[size]
          )}
        >
          <svg
            className="w-2/3 h-2/3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
