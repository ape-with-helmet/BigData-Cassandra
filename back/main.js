const express = require('express');
const cassandra = require('cassandra-driver');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Connect to Cassandra
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], // Replace with your Cassandra contact points
  localDataCenter: 'datacenter1', // Replace with your Cassandra data center
  keyspace: 'blog_keyspace'
});

client.connect()
  .then(() => { console.log('Cassandra connected') })
  .catch((error) => { console.error('Error connecting to Cassandra:', error) });

// Endpoint to create a blog post
app.post("/createBlog", async (req, res) => {
  try {
    const { author, title, content, tags } = req.body;
    if (!author || !title || !content || !tags) {
      return res.status(400).send({ message: "All fields are required!" });
    }

    const query = 'INSERT INTO blog (id, author, title, content, tags, created_at, updated_at) VALUES (uuid(), ?, ?, ?, ?, toTimestamp(now()), toTimestamp(now()))';
    const params = [author, title, content, tags];

    await client.execute(query, params, { prepare: true });
    return res.status(201).send({ message: "Blog created successfully" });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Endpoint for login (assuming user data is also in Cassandra)
app.post("/login", async (req, res) => {
  try {
    const { email, pwd } = req.body;
    if (!email || !pwd) {
      return res.status(400).send({ message: "Both email and password are required!" });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND pwd = ?';
    const params = [email, pwd];
    const result = await client.execute(query, params, { prepare: true });

    if (result.rowLength > 0) {
      return res.send({ message: "Login successful", status: 200 });
    } else {
      return res.send({ message: "Invalid email or password!", status: 401 });
    }
  } catch (error) {
    console.error("Error during login attempt:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Endpoint to get all blog posts
app.get("/getBlogs", async (req, res) => {
  try {
    const query = 'SELECT * FROM blog';
    const result = await client.execute(query);

    if (result.rowLength > 0) {
      return res.status(200).send({ message: "Success", data: result.rows });
    } else {
      return res.status(404).send({ message: "No blogs found!" });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Endpoint to get blogs by a specific user
app.post("/getUserBlogs", async (req, res) => {
  try {
    const { author } = req.body;

    const query = 'SELECT * FROM blog WHERE author = ? ALLOW FILTERING';
    const params = [author];
    const result = await client.execute(query, params, { prepare: true });

    if (result.rowLength > 0) {
      return res.status(200).send({ message: "Success", data: result.rows });
    } else {
      return res.status(404).send({ message: "No blogs found for this author!" });
    }
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Endpoint to update a blog post
app.put('/updateBlog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const query = 'UPDATE blog SET title = ?, content = ?, updated_at = toTimestamp(now()) WHERE id = ?';
    const params = [title, content, id];

    await client.execute(query, params, { prepare: true });
    res.status(200).json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to delete a blog post
app.delete('/deleteBlog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM blog WHERE id = ?';
    const params = [id];

    await client.execute(query, params, { prepare: true });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
