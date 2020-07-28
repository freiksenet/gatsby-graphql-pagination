import React from "react"
import { graphql, Link, unstable_collectionGraphql } from "gatsby"

export default ({ data }) => {
  return (
    <div>
      <div>
        Showing {data.personYamlPaginated.pageInfo.itemCount} of{" "}
        {data.personYamlPaginated.pageInfo.totalCount}
      </div>
      <div>
        <Pagination
          pageInfo={data.personYamlPaginated.pageInfo}
          baseUrl={"/all"}
        />
      </div>
      <ul>
        {data.personYamlPaginated.items.map(({ age, name }, i) => (
          <li key={i}>
            <b>{name}</b>: {age} years old
          </li>
        ))}
      </ul>
    </div>
  )
}

function Pagination({ pageInfo, baseUrl }) {
  const pageLinks = []
  for (let pageNo = 1; pageNo <= pageInfo.pageCount; pageNo++) {
    if (pageNo === pageInfo.currentPage) {
      pageLinks.push(
        <span style={paginationStyle} key={pageNo}>
          {pageNo}
        </span>
      )
    } else {
      pageLinks.push(
        <Link style={paginationStyle} key={pageNo} to={baseUrl + "/" + pageNo}>
          {pageNo}
        </Link>
      )
    }
  }
  return (
    <>
      {pageInfo.hasPreviousPage ? (
        <Link
          style={paginationStyle}
          to={baseUrl + "/" + (pageInfo.currentPage - 1)}
        >
          {"<"}
        </Link>
      ) : null}
      {pageLinks}
      {pageInfo.hasNextPage ? (
        <Link
          style={paginationStyle}
          to={baseUrl + "/" + (pageInfo.currentPage + 1)}
        >
          {">"}
        </Link>
      ) : null}
    </>
  )
}

const paginationStyle = {
  padding: "0 2px",
}

export const collectionQuery = unstable_collectionGraphql`
  {
    allPersonYamlPaginated(pageSize: 10) {
      ...CollectionPagesQueryFragment
    }
  }
`

export const query = graphql`
  query AllPageQuery($pageInfo__currentPage: Int!) {
    personYamlPaginated(pageSize: 10, pageNo: $pageInfo__currentPage) {
      items {
        age
        name
      }
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
