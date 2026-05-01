type Props = { msg?: string };
export function Loader({ msg = "Loading..." }: Props) {
  return (
    <div className="fixed inset-0 z-[600] bg-background/95 flex flex-col items-center justify-center gap-3.5">
      <div className="w-9 h-9 rounded-full border-[3px] border-line border-t-brand animate-spin-brand" />
      <p className="text-[13px] text-muted-text font-semibold">{msg}</p>
    </div>
  );
}
