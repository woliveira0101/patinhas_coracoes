# Guia de Deploy - Patinhas API

Este guia explica passo a passo como colocar a Patinhas API em produção usando a AWS (Amazon Web Services). Mesmo se você não tiver experiência avançada com deploy de aplicações, este guia irá te ajudar a entender e executar cada etapa do processo.

## Pré-requisitos

Antes de começar, você precisará instalar e configurar algumas ferramentas em seu computador:

1. **AWS CLI (Command Line Interface)**
   - O que é: Uma ferramenta que permite interagir com os serviços AWS através do terminal
   - Como instalar:
     - Windows: Baixe o instalador em https://aws.amazon.com/cli/
     - Mac: Execute `brew install awscli`
     - Linux: Execute `sudo apt-get install awscli`
   - Após instalar, configure com suas credenciais AWS:
     ```bash
     aws configure
     # Você precisará informar:
     # - AWS Access Key ID
     # - AWS Secret Access Key
     # - Default region (use sa-east-1 para São Paulo)
     # - Default output format (deixe json)
     ```

2. **Docker**
   - O que é: Ferramenta para criar e gerenciar containers
   - Como instalar:
     - Windows/Mac: Baixe o Docker Desktop em https://www.docker.com/products/docker-desktop
     - Linux: Execute `sudo apt-get install docker.io`

3. **Conta AWS**
   - Acesse https://aws.amazon.com
   - Crie uma conta se ainda não tiver
   - Tenha em mãos suas credenciais de acesso (Access Key e Secret Key)

## Gerando Credenciais AWS

Antes de prosseguir com a configuração dos serviços, você precisa gerar as credenciais de acesso AWS (Access Key ID e Secret Access Key). Estas credenciais são essenciais para que as ferramentas e a aplicação possam se comunicar com os serviços AWS.

### Como Gerar as Credenciais

1. Acesse o Console AWS (https://console.aws.amazon.com)
2. Clique no seu nome de usuário no canto superior direito
3. No menu dropdown, clique em "Security credentials"
4. Role a página até a seção "Access keys"
5. Clique em "Create access key"

6. Na tela de criação de access key:
   - Selecione "Command Line Interface (CLI)"
   - Marque a caixa de confirmação
   - Clique em "Next"
   - (Opcional) Adicione uma tag de descrição: "PatinhasAPIDeploy"
   - Clique em "Create access key"

7. IMPORTANTE: Na tela de confirmação
   - Você verá o "Access key ID" e "Secret access key"
   - ⚠️ ESTA É A ÚNICA VEZ que você verá a Secret Access Key
   - Clique em "Download .csv file" para salvar as credenciais
   - Guarde estas informações em um local seguro
   - Nunca compartilhe ou comita estas credenciais no código

### Configurando as Credenciais

Após gerar as credenciais, você pode configurá-las de duas formas:

1. Via AWS CLI (recomendado):
```bash
aws configure
# AWS Access Key ID: Cole seu Access Key ID
# AWS Secret Access Key: Cole seu Secret Access Key
# Default region name: sa-east-1
# Default output format: json
```

2. Via arquivo de configuração:
   - No Windows: Crie o arquivo `%UserProfile%\.aws\credentials`
   - No Linux/Mac: Crie o arquivo `~/.aws/credentials`
   - Adicione o conteúdo:
   ```
   [default]
   aws_access_key_id = sua_access_key_id
   aws_secret_access_key = sua_secret_access_key
   ```

### Boas Práticas de Segurança

1. Nunca compartilhe suas credenciais
2. Não comite as credenciais em repositórios
3. Troque as credenciais periodicamente
4. Ative autenticação de dois fatores (MFA) na sua conta AWS
5. Monitore o uso das credenciais no CloudTrail
6. Se suas credenciais forem comprometidas:
   - Desative imediatamente as credenciais no console AWS
   - Gere novas credenciais
   - Verifique e revogue qualquer acesso não autorizado

## 1. Configuração Inicial AWS

### 1.1. Criar Bucket S3 (Armazenamento de Imagens)

O S3 (Simple Storage Service) é onde vamos armazenar todas as imagens dos pets. É como um HD na nuvem, mas muito mais seguro e escalável.

```bash
# Criar o bucket (como se fosse uma pasta) para armazenar as imagens
# Este comando cria um novo bucket chamado patinhas-api-images na região de São Paulo
aws s3 mb s3://patinhas-api-images --region sa-east-1

# Configurar as permissões de acesso (CORS) para permitir que o frontend acesse as imagens
# Este comando aplica as regras de CORS definidas no arquivo cors-config.json
aws s3api put-bucket-cors --bucket patinhas-api-images --cors-configuration file://cors-config.json
```

O arquivo `cors-config.json` que criamos anteriormente define quais sites podem acessar as imagens do bucket. No nosso caso, apenas o site principal (patinhas.app) terá acesso.

### 1.2. Criar Banco de Dados (RDS PostgreSQL)

O RDS é o serviço de banco de dados da AWS. Vamos criar um banco PostgreSQL que armazenará todos os dados da aplicação.

1. Acesse o console AWS (https://console.aws.amazon.com)
2. Procure por "RDS" na barra de pesquisa
3. Clique em "Create database"
4. Configure o banco:
   - Selecione "Standard create"
   - Engine: PostgreSQL
   - Version: 14.x
   - Template: Free tier (para desenvolvimento) ou Production (para produção)
   - DB instance identifier: patinhas-db
   - Master username: piunivesp
   - Master password: [crie uma senha forte]
   - Instance configuration:
     - Para desenvolvimento: db.t3.micro (mais barato)
     - Para produção: db.t3.small (mais robusto)
   - Storage: 20GB gp2 (SSD)
   - Connectivity: 
     - VPC: Default VPC
     - Publicly accessible: No
   - Clique em "Create database"

### 1.3. Criar Redis (ElastiCache)

O Redis é usado para cache, melhorando a performance da API ao armazenar temporariamente dados frequentemente acessados.

1. No console AWS, procure por "ElastiCache"
2. Clique em "Create cluster"
3. Configure:
   - Cluster engine: Redis
   - Location: Amazon Cloud
   - Name: patinhas-cache
   - Node type: cache.t3.micro
   - Number of replicas: 0 (dev) ou 1 (prod)
   - Subnet group: Create new
     - Name: patinhas-cache-subnet
     - VPC: Default VPC
   - Security:
     - Create new security group
     - Name: patinhas-cache-sg

### 1.4. Criar Repositório de Imagens Docker (ECR)

O ECR é onde vamos guardar a imagem Docker da nossa aplicação. Pense nele como um GitHub para imagens Docker.

```bash
# Este comando cria um novo repositório para armazenar as imagens Docker da API
aws ecr create-repository \
    --repository-name patinhas-api \
    --image-scanning-configuration scanOnPush=true \
    --region sa-east-1
```

## 2. Preparação do Ambiente

### 2.1. Configurar Variáveis de Ambiente

As variáveis de ambiente são como configurações secretas que a aplicação precisa para funcionar.

1. Abra o arquivo `.env.production`
2. Atualize com os dados dos serviços que criamos:
   ```env
   # Dados do banco - copie o endpoint do RDS que você criou
   POSTGRES_HOST=[RDS-ENDPOINT] # Exemplo: patinhas-db.123456.sa-east-1.rds.amazonaws.com
   POSTGRES_PASSWORD=[SUA-SENHA-DO-RDS]

   # Dados do S3
   AWS_BUCKET_NAME=patinhas-api-images
   AWS_ACCESS_KEY_ID=[SUA-ACCESS-KEY]
   AWS_SECRET_ACCESS_KEY=[SUA-SECRET-KEY]
   AWS_REGION=sa-east-1

   # Redis - copie o endpoint do ElastiCache
   REDIS_URL=redis://[ELASTICACHE-ENDPOINT]:6379

   # URL do frontend
   FRONTEND_URL=https://patinhas.app
   ```

### 2.2. Build e Upload da Imagem Docker

Agora vamos criar a imagem Docker da aplicação e enviá-la para o ECR.

```bash
# Fazer login no ECR
# Este comando permite que o Docker se comunique com o repositório na AWS
aws ecr get-login-password --region sa-east-1 | docker login --username AWS --password-stdin [SEU-ACCOUNT-ID].dkr.ecr.sa-east-1.amazonaws.com

# Criar a imagem Docker
# Este comando cria uma imagem da aplicação usando o Dockerfile
docker build -t patinhas-api .

# Marcar a imagem para envio
# Este comando prepara a imagem para ser enviada ao ECR
docker tag patinhas-api:latest [SEU-ACCOUNT-ID].dkr.ecr.sa-east-1.amazonaws.com/patinhas-api:latest

# Enviar a imagem para o ECR
# Este comando faz o upload da imagem para o repositório na AWS
docker push [SEU-ACCOUNT-ID].dkr.ecr.sa-east-1.amazonaws.com/patinhas-api:latest
```

## 3. Deploy no ECS (Elastic Container Service)

O ECS é o serviço que vai executar nossa aplicação em containers.

### 3.1. Criar Cluster ECS

Um cluster é como um computador virtual que vai rodar nossa aplicação.

1. No console AWS, procure por "ECS"
2. Clique em "Create Cluster"
3. Configure:
   - Name: patinhas-cluster
   - Infrastructure: AWS Fargate (serverless)
   - Networking: Create new VPC (ou use existente)
   - Clique em "Create"

### 3.2. Criar Task Definition

A Task Definition é como uma receita que diz como nossa aplicação deve rodar.

1. No ECS, vá em "Task Definitions"
2. Clique em "Create new Task Definition"
3. Configure:
   - Family: patinhas-api
   - Launch type: Fargate
   - Task role: Create new
     - Name: patinhas-task-role
     - Permissions: S3FullAccess
   - Task size:
     - CPU: 0.5 vCPU
     - Memory: 1GB
   - Container Definition:
     - Name: patinhas-api
     - Image: [cole o URI da imagem do ECR]
     - Port mappings: 3000
     - Environment variables: copie todas do .env.production
     - Logging: Enable CloudWatch logs

### 3.3. Criar Serviço ECS

O serviço garante que nossa aplicação esteja sempre rodando.

1. No cluster, clique em "Create Service"
2. Configure:
   - Launch type: Fargate
   - Task Definition: selecione a que criamos
   - Service name: patinhas-api-service
   - Number of tasks: 1
   - Networking:
     - VPC: a mesma do cluster
     - Subnets: selecione todas
     - Security group: Create new
     - Load balancer: Create new Application Load Balancer

## 4. Configuração de Domínio e SSL

### 4.1. Load Balancer (Balanceador de Carga)

O Load Balancer distribui o tráfego e gerencia os certificados SSL.

1. Configure o Application Load Balancer:
   - Name: patinhas-alb
   - Listeners: 
     - HTTP (porta 80)
     - HTTPS (porta 443)
   - Target group: o criado pelo ECS
   - SSL certificate: 
     - Request new ACM certificate
     - Domain: patinhas.app

### 4.2. Configurar DNS

O DNS é como uma lista telefônica que diz onde encontrar nossa aplicação.

1. No Route 53:
   - Create hosted zone
   - Domain: patinhas.app
   - Create record
   - Type: A
   - Alias: Yes
   - Target: Application Load Balancer

## 5. Monitoramento

### 5.1. Configurar Logs

Os logs nos ajudam a identificar problemas.

1. No CloudWatch:
   - Create log group: /ecs/patinhas-api
   - Retention: 30 days

### 5.2. Configurar Alarmes

Alarmes nos avisam quando algo está errado.

1. Crie alarmes para:
   - CPU acima de 80%
   - Memória acima de 80%
   - Erros 5XX (erros do servidor)
   - Tempo de resposta alto

## 6. Manutenção

### 6.1. Como Atualizar a Aplicação

Quando precisar atualizar a API:

```bash
# Criar nova versão da imagem
docker build -t patinhas-api .
docker tag patinhas-api:latest [SEU-ACCOUNT-ID].dkr.ecr.sa-east-1.amazonaws.com/patinhas-api:latest
docker push [SEU-ACCOUNT-ID].dkr.ecr.sa-east-1.amazonaws.com/patinhas-api:latest

# Atualizar o serviço ECS
aws ecs update-service --cluster patinhas-cluster --service patinhas-api-service --force-new-deployment
```

### 6.2. Backup

1. RDS (Banco de dados):
   - Backups automáticos: 7 dias
   - Snapshot manual antes de grandes mudanças

2. S3 (Imagens):
   - Habilitar versionamento:
   ```bash
   aws s3api put-bucket-versioning --bucket patinhas-api-images --versioning-configuration Status=Enabled
   ```

## 7. Custos e Economia

Estimativa mensal:
- ECS (Fargate): ~$30-40
- RDS (db.t3.micro): ~$15-20
- ElastiCache (cache.t3.micro): ~$15-20
- Load Balancer: ~$20
- S3: ~$5-10 (depende do uso)
- Total: $85-110/mês

Dicas para economizar:
- Use instâncias reservadas para RDS e ElastiCache
- Configure auto-scaling
- Monitore uso de recursos
- Delete recursos não utilizados

## 8. Troubleshooting (Resolução de Problemas)

Se algo der errado, verifique:

1. Logs no CloudWatch:
```bash
# Ver logs da aplicação
aws logs get-log-events --log-group-name /ecs/patinhas-api --log-stream-name [NOME-DO-STREAM]
```

2. Status da aplicação:
   - Verifique o painel do ECS
   - Monitore os logs do CloudWatch
   - Verifique métricas do Load Balancer

3. Como reverter mudanças:
```bash
# Voltar para versão anterior
aws ecs update-service --cluster patinhas-cluster --service patinhas-api-service --task-definition [VERSAO-ANTERIOR]
```

## Suporte

Se precisar de ajuda:
1. Consulte a documentação AWS: https://aws.amazon.com/documentation/
2. Use o AWS Support
3. Verifique os logs no CloudWatch
4. Consulte a equipe de desenvolvimento

---

Este guia foi criado para ser o mais completo e acessível possível. Cada seção explica não apenas o que fazer, mas também por que cada passo é necessário. Se encontrar dificuldades, revise os logs e a documentação AWS correspondente.
