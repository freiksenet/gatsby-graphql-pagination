exports.createPages = async ({ graphql, actions }) => {
  const adultsFilter = { age: { gte: 18 } }
  const pageSize = 10
  const adultsPaginated = await graphql(
    `
      query AdultsPaginated($filter: PersonYamlFilterInput!, $pageSize: Int!) {
        allPersonYamlPaginated(filter: $filter, pageSize: $pageSize) {
          nodes {
            pageInfo {
              currentPage
            }
          }
        }
      }
    `,
    {
      filter: adultsFilter,
      pageSize,
    }
  )
  adultsPaginated.data.allPersonYamlPaginated.nodes.forEach(node => {
    const basePath = "/adults"
    actions.createPage({
      path: "/adults/" + node.pageInfo.currentPage,
      component: require.resolve("./src/templates/page.js"),
      context: {
        filter: adultsFilter,
        pageSize,
        pageNo: node.pageInfo.currentPage,
        baseUrl: "/adults",
      },
    })
  })
  const allPaginated = await graphql(
    `
      query AllPaginated($pageSize: Int!) {
        allPersonYamlPaginated(pageSize: $pageSize) {
          nodes {
            pageInfo {
              currentPage
            }
          }
        }
      }
    `,
    {
      filter: adultsFilter,
      pageSize,
    }
  )
  allPaginated.data.allPersonYamlPaginated.nodes.forEach(node => {
    const basePath = "/all"
    actions.createPage({
      path: "/all/" + node.pageInfo.currentPage,
      component: require.resolve("./src/templates/page.js"),
      context: {
        pageSize,
        pageNo: node.pageInfo.currentPage,
        baseUrl: "/all",
      },
    })
  })
}
