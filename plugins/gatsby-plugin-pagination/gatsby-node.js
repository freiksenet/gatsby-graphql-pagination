const _ = require("lodash")

exports.createSchemaCustomization = ({ schema, actions }, pluginOptions) => {
  ;(pluginOptions.types || []).forEach(typeName => {
    actions.createTypes([
      schema.buildObjectType({
        name: `${typeName}Paginated`,
        fields: {
          pageInfo: {
            type: "PageInfo!",
          },
          items: {
            type: `[${typeName}]`,
          },
        },
        interfaces: [`Node`],
      }),
    ])
  })
}

exports.createResolvers = (
  { createResolvers, intermediateSchema },
  pluginOptions
) => {
  const resolvers = {
    Query: {},
  }
  const queryType = intermediateSchema.getType("Query")
  const queryTypeFields = queryType.toConfig().fields
  ;(pluginOptions.types || []).forEach(typeName => {
    const allTypeName = _.camelCase(`all ${typeName}`)
    const allTypeNamePaginated = _.camelCase(`all ${typeName} Paginated`)
    const singleTypeNamePaginated = _.camelCase(`${typeName}Paginated`)
    resolvers.Query[singleTypeNamePaginated] = {
      args: {
        filter: queryTypeFields[allTypeName].args.filter,
        pageSize: {
          type: "Int!",
        },
        pageNo: {
          type: "Int!",
        },
      },
      resolve: async (parent, args, context, info) => {
        const { pageSize, pageNo } = args
        const items = await context.nodeModel.runQuery(
          {
            query: args,
            firstOnly: false,
            type: info.schema.getType(typeName),
            stats: context.stats,
            tracer: context.tracer,
          },
          { path: context.path, connectionType: typeName }
        )
        const length = items.length
        const totalPages = Math.ceil(length / pageSize)
        const page = getPage({ totalLength: length, pageSize, pageNo })
        if (page) {
          return createPageNode({
            pageNo,
            totalPages,
            pageItems: items.slice(page.from, page.to),
            pageSize,
            totalLength: length,
          })
        } else {
          return null
        }
      },
    }
    resolvers.Query[allTypeNamePaginated] = {
      type: `${typeName}PaginatedConnection`,
      args: {
        filter: queryTypeFields[allTypeName].args.filter,
        pageSize: {
          type: "Int!",
        },
      },
      resolve: async (parent, args, context, info) => {
        const items = await context.nodeModel.runQuery(
          {
            query: args,
            firstOnly: false,
            type: info.schema.getType(typeName),
            stats: context.stats,
            tracer: context.tracer,
          },
          { path: context.path, connectionType: typeName }
        )
        const pageSize = args.pageSize
        const length = items.length
        const totalPages = Math.ceil(length / pageSize)
        const nodes = []
        let pageNo = 1
        let page = getPage({ totalLength: length, pageSize, pageNo })
        while (page != null) {
          const pageItems = items.slice(page.from, page.to)
          nodes.push(
            createPageNode({
              typeName: singleTypeNamePaginated,
              filter: queryTypeFields[allTypeName].args.filter || {},
              pageNo,
              totalPages,
              pageItems,
              pageSize,
              totalLength: length,
            })
          )
          pageNo++
          page = getPage({ totalLength: length, pageSize, pageNo })
        }
        const edges = nodes.map((node, i) => ({
          node,
          next: nodes[i + 1],
          previous: node[i - 1],
        }))
        return {
          totalCount: totalPages,
          edges,
          nodes,
          pageInfo: {
            currentPage: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            itemCount: totalPages,
            pageCount: 1,
            perPage: totalPages,
            totalCount: totalPages,
          },
        }
      },
    }
  })
  createResolvers(resolvers)
}

function getPage({ totalLength, pageSize, pageNo }) {
  const totalCount = Math.ceil(totalLength / pageSize)
  if (pageNo <= totalCount) {
    const from = (pageNo - 1) * pageSize
    const to = pageNo * pageSize
    return {
      pageNo: pageNo,
      from,
      to: Math.min(totalLength, to),
    }
  } else {
    return null
  }
}

function createPageNode({
  typeName,
  filter,
  pageNo,
  totalPages,
  totalLength,
  pageItems,
  pageSize,
}) {
  return {
    id: `${typeName}_pageSize_${pageSize}_filter_${JSON.stringify(
      filter
    )}_page_${pageNo}`,
    pageNo: pageNo,
    items: pageItems,
    pageInfo: {
      currentPage: pageNo,
      hasPreviousPage: pageNo > 1,
      hasNextPage: pageNo < totalPages - 1,
      itemCount: pageItems.length,
      pageCount: totalPages,
      perPage: pageSize,
      totalCount: totalLength,
    },
  }
}
