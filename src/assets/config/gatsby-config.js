module.exports = {
  siteMetadata: {
    siteUrl: "https://lavandi.pl",
    title: "Lavandi – Studio masażu w Warszawie",
    description:
      "Lavandi oferuje profesjonalne masaże w Warszawie: relaksacyjny, klasyczny, limfodrenaż, sportowy, antycellulitowy, twarzy oraz masaż autorski. Umów się online i poczuj ulgę i odprężenie.",
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/sitemap.xml`,
      },
    },
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        host: "https://lavandi.pl",
        sitemap: "https://lavandi.pl/sitemap.xml",
        policy: [{userAgent: "*", allow: "/"}],
      },
    },
  ],
};
