# Patinhas API

API REST para plataforma de adoção e doação de pets.

## Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Docker
- JWT para autenticação
- Swagger para documentação
- Jest para testes

## Requisitos

- Node.js 14+
- PostgreSQL 12+
- NPM ou Yarn

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/patinhas-api.git
cd patinhas-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
# Servidor
PORT=3000
NODE_ENV=development

# Database
POSTGRES_URI=postgresql://usuario:senha@localhost:5432/patinhas_db

# JWT
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

## Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Desenvolvimento com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Configuração para Desenvolvimento

1. Copie o arquivo de ambiente de desenvolvimento:
```bash
cp .env.development .env
```

2. Inicie os serviços usando Docker Compose:
```bash
# Para desenvolvimento
docker compose -f docker compose.dev.yml up --build
```

### Armazenamento de Imagens

#### Desenvolvimento
- Imagens são armazenadas localmente em `./uploads`
- Configuração no `.env.development`: `STORAGE_TYPE=local`

#### Produção
- Imagens são armazenadas no Amazon S3
- Configure as credenciais AWS no `.env.production`
- Configuração: `STORAGE_TYPE=s3`

### Comandos Úteis com Docker

#### Desenvolvimento
```bash
# Iniciar serviços
docker compose -f docker compose.dev.yml up --build -d

# Parar serviços
docker compose -f docker compose.dev.yml down

# Executar migrações
docker compose -f docker compose.dev.yml exec api npm run migrate

# Executar testes
docker compose -f docker compose.dev.yml exec api npm test
```

#### Produção
```bash
# Iniciar serviços
docker compose up --build

# Parar serviços
docker compose down

# Executar migrações
docker compose exec api npm run migrate

# Executar testes
docker compose exec api npm test
```

## Estrutura do Projeto

```
src/
├── config/         # Configurações (database, etc)
├── controllers/    # Controladores da API
├── middleware/     # Middlewares Express
├── models/         # Modelos Sequelize
├── routes/         # Rotas da API
├── utils/          # Utilitários
├── app.js         # Configuração Express
└── server.js      # Entrada da aplicação
```

## API Endpoints

### Usuários (/users)
#### Operações Básicas
- GET /users - Retorna uma lista de todos os usuários
- POST /users - Cria um novo usuário
- GET /users/{user_id} - Retorna os detalhes do usuário
- PUT /users/{user_id} - Atualiza as informações do usuário
- DELETE /users/{user_id} - Deleta o usuário

#### Recursos Aninhados
##### Endereços do Usuário
- GET /users/{user_id}/addresses - Retorna os endereços do usuário
- POST /users/{user_id}/addresses - Adiciona um novo endereço
- GET /users/{user_id}/addresses/{address_id} - Retorna um endereço específico
- PUT /users/{user_id}/addresses/{address_id} - Atualiza um endereço
- DELETE /users/{user_id}/addresses/{address_id} - Remove um endereço

##### Adoções do Usuário
- GET /users/{user_id}/adoptions - Lista adoções do usuário
- POST /users/{user_id}/adoptions - Cria nova solicitação de adoção
- GET /users/{user_id}/adoptions/{adoption_id} - Retorna detalhes da adoção
- PUT /users/{user_id}/adoptions/{adoption_id} - Atualiza uma adoção
- DELETE /users/{user_id}/adoptions/{adoption_id} - Cancela uma adoção

##### Doações do Usuário
- GET /users/{user_id}/donations - Lista doações do usuário
- POST /users/{user_id}/donations - Registra nova doação
- GET /users/{user_id}/donations/{donation_id} - Retorna detalhes da doação
- DELETE /users/{user_id}/donations/{donation_id} - Remove registro de doação

### Pets (/pets)
#### Operações Básicas
- GET /pets - Lista todos os pets disponíveis
- POST /pets - Adiciona um novo pet
- GET /pets/{pet_id} - Retorna detalhes do pet
- PUT /pets/{pet_id} - Atualiza informações do pet
- DELETE /pets/{pet_id} - Remove o pet

#### Recursos Aninhados
##### Imagens do Pet
- GET /pets/{pet_id}/images - Retorna todas as imagens do pet
- POST /pets/{pet_id}/images - Adiciona nova imagem
- GET /pets/{pet_id}/images/{image_id} - Retorna uma imagem específica
- DELETE /pets/{pet_id}/images/{image_id} - Remove uma imagem

##### Adoções do Pet
- GET /pets/{pet_id}/adoptions - Lista solicitações de adoção do pet
- GET /pets/{pet_id}/adoptions/{adoption_id} - Retorna detalhes da adoção

##### Doações do Pet
- GET /pets/{pet_id}/donations - Retorna histórico de doações do pet
- GET /pets/{pet_id}/donations/{donation_id} - Retorna detalhes da doação

### Adoções (/adoptions)
#### Operações Básicas
- GET /adoptions - Lista todas as adoções
- POST /adoptions - Cria nova solicitação
- GET /adoptions/{adoption_id} - Retorna detalhes da adoção
- PUT /adoptions/{adoption_id} - Atualiza informações
- DELETE /adoptions/{adoption_id} - Cancela adoção

#### Recursos Aninhados
##### Perguntas da Adoção
- GET /adoptions/{adoption_id}/questions - Lista perguntas da adoção
- POST /adoptions/{adoption_id}/questions - Adiciona nova pergunta
- GET /adoptions/{adoption_id}/questions/{question_id} - Retorna detalhes

##### Respostas da Adoção
- GET /adoptions/{adoption_id}/answers - Lista respostas fornecidas
- POST /adoptions/{adoption_id}/answers - Submete respostas
- GET /adoptions/{adoption_id}/answers/{answer_id} - Retorna detalhes
- PUT /adoptions/{adoption_id}/answers/{answer_id} - Atualiza resposta
- DELETE /adoptions/{adoption_id}/answers/{answer_id} - Remove resposta

### Doações (/donations)
- GET /donations - Lista todas as doações
- POST /donations - Registra nova doação
- GET /donations/{donation_id} - Retorna detalhes
- DELETE /donations/{donation_id} - Remove doação

### Perguntas (/questions)
#### Operações Básicas
- GET /questions - Lista todas as perguntas
- POST /questions - Adiciona nova pergunta
- GET /questions/{question_id} - Retorna detalhes
- PUT /questions/{question_id} - Atualiza pergunta
- DELETE /questions/{question_id} - Remove pergunta

#### Recursos Aninhados
##### Tipos de Perguntas
- GET /questions/types - Lista tipos de perguntas
- POST /questions/types - Adiciona novo tipo
- GET /questions/types/{type_id} - Retorna detalhes
- PUT /questions/types/{type_id} - Atualiza tipo
- DELETE /questions/types/{type_id} - Remove tipo

### Endereços (/addresses)
- GET /addresses - Lista todos os endereços
- POST /addresses - Adiciona novo endereço
- GET /addresses/{address_id} - Retorna detalhes
- PUT /addresses/{address_id} - Atualiza endereço
- DELETE /addresses/{address_id} - Remove endereço

### Imagens dos Pets (/pet_images)
- GET /pet_images - Lista todas as imagens
- POST /pet_images - Adiciona nova imagem
- GET /pet_images/{image_id} - Retorna detalhes
- DELETE /pet_images/{image_id} - Remove imagem

## Recursos Aninhados

A API implementa recursos aninhados para representar relacionamentos entre entidades:

1. Usuários podem ter:
   - Endereços (relacionamento 1:N)
   - Adoções (relacionamento 1:N)
   - Doações (relacionamento 1:N)

2. Pets podem ter:
   - Imagens (relacionamento 1:N)
   - Adoções (relacionamento 1:N)
   - Doações (relacionamento 1:N)

3. Adoções podem ter:
   - Perguntas (relacionamento N:N)
   - Respostas (relacionamento 1:N)

4. Perguntas podem ter:
   - Tipos (relacionamento N:1)

## Rate Limiting

A API implementa limites de taxa para prevenir abusos:

- Endereços: 100 requisições por IP a cada 15 minutos
- Geral: Configurável através das variáveis de ambiente RATE_LIMIT_WINDOW e RATE_LIMIT_MAX

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. O token deve ser incluído no header Authorization de todas as requisições que requerem autenticação:

```
Authorization: Bearer <seu_token_jwt>
```

O token contém o ID do usuário e é usado para:
- Autenticar o usuário
- Identificar o usuário para operações específicas
- Garantir acesso apenas aos próprios recursos

## Documentação

A documentação completa da API está disponível em:
```
http://localhost:3000/api-docs
```

## Testes

### Executando testes

Existem diferentes maneiras de executar os testes do projeto:

1. Usando o script shell:
```bash
chmod +x run-tests.sh && ./run-tests.sh
```
Este comando dá permissão de execução ao script de testes e o executa. É útil quando você precisa executar uma sequência específica de comandos de teste, incluindo configuração de ambiente e limpeza.

2. Executando todos os testes com Docker:
```bash
docker compose -f docker compose.test.yml run --rm test npm test
```
Este comando executa todos os testes em um ambiente Docker isolado, garantindo consistência independente do ambiente local. É recomendado para CI/CD e para garantir que os testes funcionem em um ambiente limpo.

3. Executando testes específicos com Docker:
```bash
docker compose -f docker compose.test.yml run --rm test npm test tests/donation.test.js
```
Use este comando quando precisar focar em um arquivo de teste específico. É útil durante o desenvolvimento quando você está trabalhando em uma funcionalidade específica.

### Testes Adicionais
```bash
# Todos os testes
npm test

# Com coverage
npm run test:coverage
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
