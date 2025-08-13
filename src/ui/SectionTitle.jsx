function SectionTitle({children}) {
  return (
    <div className="flex flex-col items-center pb-12 sm:pb-24 px-3 sm:px-6">
      <span className="w-12 sm:w-20 md:w-24 h-0.5 bg-primaryColor-600/20 block" />

      <h2 className="text-primaryColor text-3xl lg:text-5xl font-thin text-center py-3 sm:py-5 leading-snug">
        {children}
      </h2>
    </div>
  );
}

export default SectionTitle;
