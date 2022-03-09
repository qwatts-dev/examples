# QW Fix 'See More' Btn

*07/21/2021*

*Version: 0.0.3*

*Author: Quentin Watts*

## Description:  
After a 2019 NetSuite update, the "see more" button for product description displays indefinitely. 
This fix restores original functionality to hide this button, when not needed, and also allows the product details section to show/hide on click.

## Changelog:
- 0.0.3 - Further specified tabpanel text content. Removed 'check if active' - content is already active once clicked.
- 0.0.2 - Added support to run script on page load
- 0.0.1 - N/A

## Instructions:
1. Navigate to an item on website: https://www.hellodirect.com/logitech-zone-wired-earbuds-uc
2. Click the [esc] key on keyboard
3. Log into the CMS dashboard
4. Click the 'Edit Mode' (pencil) icon and locate the `JS: Product Details` block and edit it
5. Paste in the HTML from the `2021-07-21 - JS Product Details.html` file
6. Save and Publish