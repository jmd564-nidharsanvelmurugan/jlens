export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center justify-between">
        <div></div>
        <div className="text-[11px] text-gray-500">
          <p className="font-bold">v0.0.1 - Private Preview (PrPr)</p>
          <p>Powered by Technology CoE</p>
        </div>
      </div>
    </div>
  );
}