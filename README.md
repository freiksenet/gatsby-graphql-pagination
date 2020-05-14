# Gatsby GraphQL Pagination example

This is a proposed plugin for Gatsby to do pagination through GraphQL. See plugin in `plugins/gatsby-plugin-pagination` and example code in `gatsby-node.js` and `src/templates/page.js`.

## Wut?

This tries to simplify the way one can do pagination in Gatsby by inverting a common pagination pattern. Gatsby is a pre-rendered static framework, when doing pagination you want to operate on whole data, not retrieve one slice of that data. This means that you would usually query for all data in `gatsby-node.js` and manually split it into pages.

This proposes a plugin that abstracts pagination in a plugin. This plugin creates additional types that wrap normal node types into paginated containers. User can retrieve already paginated data, alongside all metadata needed to createPage. In addition, user can retrieve a page from that pagination to render separate paginated pages.

## Usage

`gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-pagination",
      options: {
        // Type that you want to get paginated types
        types: ["PersonYaml"],
      },
    },
  ],
}
```

This will create a new type for you - `PersonYamlPaginated` alongside two root fields to query it `allPersonYamlPaginated` and `personYamlPaginated`. Then in `gatsby-node.js` you can use it to get your pages.

```js
exports.createPages = async ({ graphql, actions }) => {
  const person = await graphql(
    `
      query AllPaginated($pageSize: Int!) {
        allPersonYamlPaginated(pageSize: 10) {
          nodes {
            # Page info has same fields as usual connection PageInfo object
            pageInfo {
              currentPage
            }
          }
        }
      }
    `
  )
  allPaginated.data.allPersonYamlPaginated.nodes.forEach(node => {
    actions.createPage({
      path: `/person/${node.pageInfo.currentPage$}`,
      component: require.resolve("./src/templates/page.js"),
      context: {
        pageSize,
        pageNo: node.pageInfo.currentPage,
      },
    })
  })
}
```

Inside the template, you can query the actual page that you want to retrieve.

```js
export const query = graphql`
  query PageQuery($pageSize: Int!, $pageNo: Int!) {
    personYamlPaginated(pageSize: $pageSize, pageNo: $pageNo) {
      # Items to display on the page
      items {
        age
        name
      }
      # Page info to create pagination
      pageInfo {
        hasNextPage
        hasPreviousPage
        pageCount
        perPage
        itemCount
        currentPage
        totalCount
      }
    }
  }
`
```

It's also possible to pass `filter` parameter to the paginated root fields. This filter will be the same filter you'd pass to non-paginated version (so it will filter by `PersonYaml` fields). Make sure to pass same `filter` and `pageSize` to both `allXPaginated` field and `xPaginated` one.
