module.exports = {
  siteMetadata: {
    siteUrl: "https://lavandi.pl", // укажи точный адрес сайта
    title: "Lavandi – Studio masażu w Warszawie",
    description:
      "Lavandi oferuje profesjonalne masaże w Warszawie: relaksacyjny, klasyczny, limfodrenaż, sportowy, antycellulitowy, twarzy oraz masaż autorski. Umów się online i poczuj ulgę i odprężenie.",
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        policy: [{userAgent: "*", allow: "/"}],
      },
    },
    // Если используешь изображения:
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
  ],
};
