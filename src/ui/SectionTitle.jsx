function SectionTitle({children}) {
  return (
    <div className="flex flex-col items-center py-10 px-4 sm:px-6">
      <span className="w-16 sm:w-24 h-0.5 bg-primaryColor-600/20 block" />
      <h2 className="text-primaryColor-500 text-3xl sm:text-4xl lg:text-5xl font-thin text-center py-5 leading-snug">
        {children}
      </h2>
    </div>
  );
}

export default SectionTitle;
