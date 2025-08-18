export default ({ title, description }: { title: string; description: string }) => {
  return (
    <>
      <div className={'flex justify-center'}>
        <div className={'w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 bg-gray-600 rounded-lg shadow-lg text-center relative'}>
          <h2 className={'mt-10 text-neutral-100 font-bold text-4xl'}>{title}</h2>
          <p className={'text-sm text-neutral-700 mt-2'}>{description}</p>
        </div>
      </div>
    </>
  );
};
