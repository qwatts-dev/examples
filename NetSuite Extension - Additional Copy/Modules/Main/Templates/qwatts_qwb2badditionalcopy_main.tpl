<!-- log available context objects - i.e. {{context.item}} -->
{{log this}}

<!-- START template -->
{{#if additionalcopy}} 
  <div class="qw-b2b-additional-copy">
      {{additionalcopy}} 
  </div>
{{else}}
  <!-- Do Nothing -->
{{/if}}
<!-- END template -->


<!--
  Available helpers:
  {{additionalcopy}} - Microsite Item-Item Description, on the Microsite Item record.

  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension
  
  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder
  
  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme
  
  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->