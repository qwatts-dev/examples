# Additional Copy Extension

*9/1/2022*

*Author: Quentin Watts*

*Version: 1.0.0*

---

## Description:

This plugin/extension is designed to add addition copy/text to the Product List Page, per item, if that additional text is included in the **Microsite-Item Description** field on the **Microsite-Item** record.

**Note:** You must have knowledge of using NetSuite Extension Developer Tools.


## Steps: Deploy Extension to Hello Direct - B2B

### On Computer
1. Open Developer Tools root directory on your computer
2. Open Command Line or Terminal at this directory
3. Type `gulp extension:deploy`
4. Select extension **/QWB2BAdditionalCopy/** and follow instructions in terminal
5. Done (on computer)


### In NetSuite
6. Navigate to Commerce > Extensions > Extension Manager
7. Click **Edit** on the Hello Direct B2B Website
8. Click the **Extensions** subtab
9. Locate this extension's name, check the box, then click **Activate**
10. Allow 2-5 min for the activation, then check the website to see extension live

---

## Extension Files Description

***Note:** For more detailed info, please read comments in each file.*

### `Modules\Main\SuiteScript2\Main.Service.ss`

- uses the extensibility API to interact with the backend of NetSuite. 
- accesses Microsite-Item record, looks at the 'description' field
- if there is info, passess that info back to the main module



### `Modules\Main\Templates\qwatts_qwb2badditionalcopy_main.tpl`

- a handlebars template that receives properties and configures html based on those properties



### `Modules\Main\Sass\_qwb2badditionalcopy-main.scss`

- styles for main template (above)



### `Modules\Main\JavaScript\Main.View.js`

- module to configure the **View**
- specifies the template to use when rendering data
- renders that data on the page, using the specified template


### `Modules\Main\JavaScript\QWatts.QWB2BAdditionalCopy.Main.js`

- main Module
- mounts the extension to user facing html page


***
**NOTE**

Important: The code and folder structure has been modified to remove proprietary information and may not be a fully functional example. 
***