import fs from 'fs';
const file = 'c:/Users/SM/Desktop/anto/bff/client/src/features/application-lab/application-recipes/components/BasicInformation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-3 gap-y-1 lg:gap-y-1 xl:gap-y-2 2xl:gap-y-3 3xl:gap-y-4 gap-x-6 py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 my-1 lg:my-1 xl:my-2 2xl:my-3 3xl:my-4 overflow-x-hidden">/,
  `<div className="grid grid-cols-1 lg:grid-cols-3 gap-y-1 lg:gap-y-1 xl:gap-y-2 2xl:gap-y-3 3xl:gap-y-4 gap-x-6 py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 my-1 lg:my-1 xl:my-2 2xl:my-3 3xl:my-4 overflow-x-hidden">
      <div className="col-span-full mb-2 p-2 bg-red-100 text-red-800 font-bold">
        DEBUG: isIndependent={String(isIndependent)} | isEditMode={String(isEditMode)} | recipe.isIndependentRecipe={String(recipe?.isIndependentRecipe)}
      </div>`
);

fs.writeFileSync(file, content);
console.log('done replacing debug');
