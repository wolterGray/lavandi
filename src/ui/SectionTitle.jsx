function SectionTitle({children}) {
  return (
    <div className="flex flex-col items-center uppercase pb-8 sm:pb-12 px-3 sm:px-6">
      <span className="w-12 sm:w-20 md:w-24 h-0.5 bg-primaryColor-600/20 block" />

      <h2 className="text-primaryColor text-3xl lg:text-5xl font-montserrat font-normal text-center  leading-snug">
        {children}
      </h2>
    </div>
  );
}

export default SectionTitle;
