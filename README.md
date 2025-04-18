
# Distributed ItemExchange Microservices Architecture

This project is a distributed microservices architecture for an ItemExchange marketplace, using PostgreSQL Citus for distributed database management and Docker Compose for easy deployment.

## Architecture Overview

The system is split into the following components:

1. **Load Balancer**: API Gateway that routes requests to the appropriate microservice
2. **Account Service**: Handles user authentication and account management
3. **Product Service**: Manages product listings and searches
4. **Transaction Service**: Processes purchases and maintains transaction history
5. **PostgreSQL Citus Cluster**: Distributed database with a master node, 3 worker nodes for sharding, and 3 replica nodes

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Installation and Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd itemexchange
   ```

2. Start the services:
   ```
   docker-compose up -d
   ```

3. The application will be available at:
   - API Gateway/Load Balancer: http://localhost:5000
   - Account Service: http://localhost:5001
   - Product Service: http://localhost:5002
   - Transaction Service: http://localhost:5003

## Database Architecture

The system uses PostgreSQL Citus, a distributed database extension for PostgreSQL that shards and replicates your data across multiple nodes:

- **Master Node**: Coordinates queries and maintains metadata
- **Worker Nodes (3)**: Store sharded data based on distribution keys
- **Replica Nodes (3)**: Provide read replicas of worker nodes for high availability

Tables are distributed as follows:
- `users`: Distributed by `id`
- `items`: Distributed by `seller_id`
- `transactions`: Distributed by `seller_id`

## API Endpoints

### Account Service (Port 5001)
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/users/profile`: Get user profile
- `POST /api/users/deposit`: Deposit funds to user account

### Product Service (Port 5002)
- `GET /api/items`: Get all items
- `GET /api/items/:id`: Get single item
- `POST /api/items`: Create new item
- `PUT /api/items/:id`: Update an item
- `DELETE /api/items/:id`: Delete an item
- `GET /api/items/search/:query`: Search items
- `GET /api/items/user/:userId`: Get user's items

### Transaction Service (Port 5003)
- `GET /api/transactions/purchases`: Get user's purchases
- `GET /api/transactions/sales`: Get user's sales
- `POST /api/transactions/purchase/:id`: Purchase an item
- `GET /api/transactions/reports`: Get transaction reports

## Scaling

This architecture is designed to scale horizontally:

1. **Application Layer**: Each microservice can be scaled independently by adding more containers
2. **Database Layer**: Additional worker nodes can be added to the Citus cluster for more sharding
3. **Read Replicas**: More read replicas can be added for read-heavy workloads

## Monitoring and Management

Health check endpoints are available for each service at:
- `/health`

## Security

- All authenticated endpoints require a JWT token in the `x-auth-token` header
- Passwords are hashed using bcrypt
- Database credentials are managed via environment variables

## Future Enhancements

- Add service discovery with Consul or etcd
- Implement message queues for asynchronous processing
- Add monitoring with Prometheus and Grafana
- Implement rate limiting and circuit breakers
