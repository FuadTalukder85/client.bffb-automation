export default function PageHeader({ title, className, subTitle }) {
  return (
    <div>
      <h1
        className={`text-2xl lg:text-xl xl:text-4xl 3xl:text-6xl font-semibold xl:font-bold ${className}`}
      >
        {title}
      </h1>
      {subTitle && <p className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg">{subTitle}</p>}
    </div>
  );
}
