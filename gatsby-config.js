/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: "gatsby-transformer-yaml",
    },
    {
      resolve: "gatsby-plugin-pagination",
      options: {
        types: ["PersonYaml"],
      },
    },
  ],
}
