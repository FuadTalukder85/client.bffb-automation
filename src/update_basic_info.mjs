import fs from 'fs';
const file = 'c:/Users/SM/Desktop/anto/bff/client/src/features/application-lab/application-recipes/components/BasicInformation.jsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

content = content.replace(
  /const pickFirst = \(\.\.\.values\) =>\n\s*values\.find\(\(value\) => value !== undefined && value !== null && value !== ""\);/,
  `const pickFirst = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

  const isIndependent = recipe?.isIndependentRecipe;

  const renderField = (label, fieldName, projectValue, placeholder = "N/A", rightIcon = null) => {
    const isIndField = isIndependent && isEditMode;
    const value = isIndependent 
      ? (recipe?.independentDetails?.[fieldName] || "") 
      : (projectValue || placeholder);
    
    return (
      <div className={inputWrapperClass}>
        <label className={labelClass}>{label}</label>
        <Input
          value={value}
          readOnly={!isIndField}
          placeholder={isIndField ? \`Enter \${label.toLowerCase()}\` : undefined}
          rightIcon={rightIcon}
          className={cn(inputContainerClass, !isIndField && "bg-gray-100 opacity-70 dark:bg-primary/10")}
          inputClassName={inputClass}
          onChange={(e) => handleRecipeChange("independentDetails", { ...(recipe?.independentDetails || {}), [fieldName]: e.target.value })}
        />
      </div>
    );
  };`
);

content = content.replace(
  /\{\/\* Raised By \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Raised By<\/label>\n\s*<Input\n\s*value=\{mergedProject\?\.raisedBy \|\| mergedMasterProject\?\.raisedBy \|\| "Business Development"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Raised By */}
      {renderField("Raised By", "raisedBy", mergedProject?.raisedBy || mergedMasterProject?.raisedBy || "Business Development")}`
);

content = content.replace(
  /\{\/\* Purpose \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Purpose<\/label>\n\s*<Input\n\s*value=\{pickFirst\(mergedProject\?\.purpose, mergedMasterProject\?\.purpose, "N\/A"\)\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Purpose */}
      {renderField("Purpose", "purpose", pickFirst(mergedProject?.purpose, mergedMasterProject?.purpose, "N/A"))}`
);

content = content.replace(
  /\{\/\* Purpose Name \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Purpose Name<\/label>\n\s*<Input\n\s*value=\{fallbackProjectName\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Purpose Name */}
      {renderField("Purpose Name", "projectName", fallbackProjectName)}`
);

content = content.replace(
  /\{\/\* Objective \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Objective<\/label>\n\s*<Input\n\s*value=\{pickFirst\(mergedProject\?\.objective, mergedMasterProject\?\.objective, "N\/A"\)\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Objective */}
      {renderField("Objective", "objective", pickFirst(mergedProject?.objective, mergedMasterProject?.objective, "N/A"))}`
);

content = content.replace(
  /\{\/\* Objective Details \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Objective Details<\/label>\n\s*<Input\n\s*value=\{recipe\?\.project\?\.objectiveDetails \|\| ""\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Objective Details */}
      {renderField("Objective Details", "objectiveDetails", recipe?.project?.objectiveDetails || "")}`
);

content = content.replace(
  /\{\/\* Project Code \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Project Code<\/label>\n\s*<Input\n\s*value=\{fallbackProjectCode\}\n\s*readOnly=\{true\}\s*\/\/\s*Project code should generally not be editable\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Project Code */}
      {renderField("Project Code", "projectCode", fallbackProjectCode)}`
);

content = content.replace(
  /\{\/\* Project Name \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Project Name<\/label>\n\s*<Input\n\s*value=\{fallbackProjectName\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Project Name */}
      {renderField("Project Name", "projectName", fallbackProjectName)}`
);

content = content.replace(
  /\{\/\* Application Category \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Application Category<\/label>\n\s*<Input\n\s*value=\{typeof recipe\?\.project\?\.category === 'object' \? recipe\?\.project\?\.category\?\.name : recipe\?\.project\?\.category \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Application Category */}
      {renderField("Application Category", "applicationCategory", typeof recipe?.project?.category === 'object' ? recipe?.project?.category?.name : recipe?.project?.category || "N/A")}`
);

content = content.replace(
  /\{\/\* Application Subcategory \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Application Subcategory<\/label>\n\s*<Input\n\s*value=\{typeof recipe\?\.project\?\.subCategory === 'object' \? recipe\?\.project\?\.subCategory\?\.name : recipe\?\.project\?\.subCategory \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Application Subcategory */}
      {renderField("Application Subcategory", "applicationSubcategory", typeof recipe?.project?.subCategory === 'object' ? recipe?.project?.subCategory?.name : recipe?.project?.subCategory || "N/A")}`
);

content = content.replace(
  /\{\/\* Application Sub-subcategory \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Application Sub-subcategory<\/label>\n\s*<Input\n\s*value=\{typeof recipe\?\.project\?\.subSubCategory === 'object' \? recipe\?\.project\?\.subSubCategory\?\.name : recipe\?\.project\?\.subSubCategory \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Application Sub-subcategory */}
      {renderField("Application Sub-subcategory", "applicationSubSubcategory", typeof recipe?.project?.subSubCategory === 'object' ? recipe?.project?.subSubCategory?.name : recipe?.project?.subSubCategory || "N/A")}`
);

content = content.replace(
  /\{\/\* Target Cost \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Target Cost<\/label>\n\s*<Input\n\s*value=\{recipe\?\.project\?\.targetCost \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Target Cost */}
      {renderField("Target Cost", "targetCost", recipe?.project?.targetCost || "N/A")}`
);

content = content.replace(
  /\{\/\* Benchmark \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Benchmark<\/label>\n\s*<Input\n\s*value=\{recipe\?\.project\?\.benchmark \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Benchmark */}
      {renderField("Benchmark", "benchmark", recipe?.project?.benchmark || "N/A")}`
);

content = content.replace(
  /\{\/\* Link \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Link<\/label>\n\s*<Input\n\s*value=\{recipe\?\.project\?\.link \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Link */}
      {renderField("Link", "link", recipe?.project?.link || "N/A")}`
);

content = content.replace(
  /\{\/\* Application Tags \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Application Tags<\/label>\n\s*<Input\n\s*value=\{recipe\?\.project\?\.tags\?\.map\(tag => typeof tag === 'object' \? tag\.name : tag\)\.join\(', '\) \|\| "N\/A"\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Application Tags */}
      {renderField("Application Tags", "applicationTags", recipe?.project?.tags?.map(tag => typeof tag === 'object' ? tag.name : tag).join(', ') || "N/A")}`
);


// For Raised Date
content = content.replace(
  /\{\/\* Raised Date \*\/\}\n\s*<div className=\{inputWrapperClass\}>\n\s*<label className=\{labelClass\}>Raised Date<\/label>\n\s*<Input\n\s*value=\{formatDate\(mergedProject\?\.raisedDate \|\| mergedMasterProject\?\.raisedDate\)\}\n\s*readOnly=\{true\}\n\s*className=\{cn\(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary\/10"\)\}\n\s*inputClassName=\{inputClass\}\n\s*\/>\n\s*<\/div>/,
  `{/* Raised Date */}
      {renderField("Raised Date", "raisedDate", formatDate(mergedProject?.raisedDate || mergedMasterProject?.raisedDate))}`
);

fs.writeFileSync(file, content);
console.log('done replacing');
