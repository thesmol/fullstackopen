const dummy = (_blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;
  return blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max));
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  const groupedByAuthor = Object.groupBy(blogs, ({ author }) => author);

  let top = { author: null, posts: 0 };

  for (const [author, blogs] of Object.entries(groupedByAuthor)) {
    if (blogs.length > top.posts) {
      top.author = author;
      top.posts = blogs.length;
    }
  }

  return top;
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const groupedByAuthor = Object.groupBy(blogs, ({ author }) => author);

  let top = { author: null, likes: 0 };

  for (const [author, blogs] of Object.entries(groupedByAuthor)) {
    const allLikes = blogs.reduce((acc, blog) => acc + blog.likes, 0);
    if (allLikes > top.likes) {
      top.author = author;
      top.likes = allLikes;
    }
  }

  return top;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
