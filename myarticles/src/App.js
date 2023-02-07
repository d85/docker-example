import { useEffect, useState } from 'react'
import './App.css';

function App() {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    fetch('http://localhost:4000')
      .then(res => res.json())
      .then(data => setArticles(data))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>all articles</h1>
        {articles && articles.map(article => (
          <div key={article.id}>{article.title}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
