"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { ArrowLeftIcon, CheckIcon, CircleXIcon, SearchIcon } from "lucide-react"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  fullScreenOnMobile = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  fullScreenOnMobile?: boolean
  children: React.ReactNode
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        ref={contentRef}
        initialFocus={() =>
          contentRef.current?.querySelector<HTMLElement>("[data-slot=command-input]") ?? true
        }
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          fullScreenOnMobile &&
            "max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:grid-rows-1 max-sm:rounded-none! max-sm:ring-0 max-sm:data-open:zoom-in-100 max-sm:data-closed:zoom-out-100",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  fullScreenOnMobile = false,
  onBack,
  backLabel,
  clearLabel,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  fullScreenOnMobile?: boolean
  onBack?: () => void
  backLabel?: string
  clearLabel?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const canClear = Boolean(fullScreenOnMobile && props.value && props.onValueChange)

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "p-1 pb-0",
        fullScreenOnMobile && "max-sm:flex max-sm:items-center max-sm:gap-1 max-sm:border-b",
        fullScreenOnMobile &&
          (onBack ? "max-sm:h-16 max-sm:py-2 max-sm:pr-3 max-sm:pl-2" : "max-sm:px-4 max-sm:pt-1 max-sm:pb-3")
      )}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
      ) : null}
      <InputGroup
        className={cn(
          "h-10! rounded-xl! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!",
          fullScreenOnMobile &&
            "max-sm:h-12! max-sm:flex-1 max-sm:rounded-full! max-sm:border-0 max-sm:bg-background max-sm:ring-2 max-sm:ring-primary max-sm:*:data-[slot=input-group-addon]:pl-4! max-sm:[&>input]:pl-2.5!"
        )}
      >
        <CommandPrimitive.Input
          ref={inputRef}
          data-slot="command-input"
          enterKeyHint="search"
          className={cn(
            "w-full text-base outline-hidden md:text-sm disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon
            className={cn(
              "size-4 shrink-0 opacity-50",
              fullScreenOnMobile && "max-sm:size-4.5 max-sm:opacity-100"
            )}
          />
        </InputGroupAddon>
        {canClear ? (
          <InputGroupAddon align="inline-end" className="pr-1! sm:hidden">
            <button
              type="button"
              aria-label={clearLabel}
              onClick={() => {
                props.onValueChange?.("")
                inputRef.current?.focus()
              }}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <CircleXIcon className="size-4.5" />
            </button>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
