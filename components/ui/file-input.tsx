import * as React from "react"
import { cn } from "@/lib/utils"

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="file"
      className={cn(
        "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0",
        "file:text-sm file:font-medium file:bg-primary file:text-primary-foreground",
        "hover:file:cursor-pointer hover:file:bg-primary/90",
        "text-sm text-muted-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})

FileInput.displayName = "FileInput"

export { FileInput }

