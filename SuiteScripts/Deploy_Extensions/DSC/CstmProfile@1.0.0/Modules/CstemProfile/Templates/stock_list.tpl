<div class="stock-table-wrap table-responsive">
<table class="table">
  <th>Vendor</th>
  <th>Stock List Link</th>
{{#each stocklist }}
  <tr>
    <td>
       {{vendor}}
    </td>
    <td>
      {{#if stocklink}}
        <a target="_blank" href="{{stocklink}}">{{stocklink}} </a>
      {{else}}
      {{#if file}}
          <a href="/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698&action=downloadstocklist&id={{file}}">{{text}}</a>
      {{/if}}
      {{/if}}
    </td>
  </tr>
{{/each}}
</table>
</div>
