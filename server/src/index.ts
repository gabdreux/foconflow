import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import timeEntryRoutes from './routes/timeEntry.routes.js';
import projectRoutes from './routes/project.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;



// Middlewares globais
app.use(cors());
app.use(express.json());


// Rota de Healthcheck (para testar se a API tá viva)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Registra as rotas da aplicação
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/projects', projectRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});