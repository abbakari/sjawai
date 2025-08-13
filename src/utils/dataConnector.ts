import { DataConnection, DataSourceType, DataSourceConfig, DataSchema, QueryResult, DataQuery } from '../types/dataSource';

export class DataConnector {
  private connections: Map<string, DataConnection> = new Map();
  
  constructor() {
    this.initializeConnections();
  }

  private initializeConnections() {
    // Initialize with some sample connections
    const sampleConnections: DataConnection[] = [
      {
        id: 'oracle-prod',
        name: 'Oracle Production Database',
        type: DataSourceType.ORACLE,
        status: 'connected',
        config: {
          host: 'oracle.company.com',
          port: 1521,
          database: 'PRODDB',
          username: 'sales_user',
          serviceName: 'PRODDB.company.com'
        },
        createdAt: '2024-01-15T10:00:00Z',
        lastSync: '2024-12-12T08:30:00Z',
        description: 'Main production Oracle database containing sales and customer data',
        tags: ['production', 'sales', 'critical']
      },
      {
        id: 'olap-cube',
        name: 'Sales OLAP Cube',
        type: DataSourceType.OLAP,
        status: 'connected',
        config: {
          host: 'olap.company.com',
          port: 8080,
          cube: 'SalesAnalytics',
          dimensions: ['Time', 'Product', 'Customer', 'Geography'],
          measures: ['Sales Amount', 'Quantity', 'Profit Margin']
        },
        createdAt: '2024-02-01T14:00:00Z',
        lastSync: '2024-12-12T09:00:00Z',
        description: 'OLAP cube for sales analytics and reporting',
        tags: ['analytics', 'olap', 'reporting']
      },
      {
        id: 'power-bi-workspace',
        name: 'Corporate Power BI',
        type: DataSourceType.POWER_BI,
        status: 'connected',
        config: {
          workspaceId: 'f089354e-8366-4e18-aea3-4cb4a3a50b48',
          apiKey: 'sample-api-key',
          apiUrl: 'https://api.powerbi.com/v1.0/myorg'
        },
        createdAt: '2024-03-01T16:00:00Z',
        lastSync: '2024-12-12T07:45:00Z',
        description: 'Corporate Power BI workspace with executive dashboards',
        tags: ['powerbi', 'executive', 'dashboards']
      }
    ];

    sampleConnections.forEach(conn => {
      this.connections.set(conn.id, conn);
    });
  }

  async testConnection(config: DataSourceConfig, type: DataSourceType): Promise<boolean> {
    // Simulate connection testing
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, return true for valid configurations
        const hasRequiredFields = this.validateConfig(config, type);
        resolve(hasRequiredFields);
      }, 1000);
    });
  }

  private validateConfig(config: DataSourceConfig, type: DataSourceType): boolean {
    switch (type) {
      case DataSourceType.ORACLE:
        return !!(config.host && config.port && config.database && config.username);
      
      case DataSourceType.OLAP:
        return !!(config.host && config.cube);
      
      case DataSourceType.SQL_SERVER:
        return !!(config.host && config.database && config.username);
      
      case DataSourceType.MYSQL:
      case DataSourceType.POSTGRESQL:
        return !!(config.host && config.port && config.database && config.username);
      
      case DataSourceType.REST_API:
        return !!(config.apiUrl);
      
      case DataSourceType.POWER_BI:
        return !!(config.workspaceId && config.apiKey);
      
      default:
        return true;
    }
  }

  async createConnection(connection: Omit<DataConnection, 'id' | 'createdAt' | 'lastSync'>): Promise<DataConnection> {
    const newConnection: DataConnection = {
      ...connection,
      id: `conn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      status: 'connecting'
    };

    // Test the connection
    const isValid = await this.testConnection(connection.config, connection.type);
    newConnection.status = isValid ? 'connected' : 'error';

    this.connections.set(newConnection.id, newConnection);
    return newConnection;
  }

  getConnection(id: string): DataConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): DataConnection[] {
    return Array.from(this.connections.values());
  }

  async updateConnection(id: string, updates: Partial<DataConnection>): Promise<DataConnection | null> {
    const connection = this.connections.get(id);
    if (!connection) return null;

    const updatedConnection = { ...connection, ...updates };
    
    // If config changed, test the connection
    if (updates.config) {
      const isValid = await this.testConnection(updatedConnection.config, updatedConnection.type);
      updatedConnection.status = isValid ? 'connected' : 'error';
    }

    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteConnection(id: string): Promise<boolean> {
    return this.connections.delete(id);
  }

  async getSchema(connectionId: string): Promise<DataSchema> {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Simulate schema discovery based on connection type
    return this.discoverSchema(connection);
  }

  private async discoverSchema(connection: DataConnection): Promise<DataSchema> {
    // Simulate different schema structures based on data source type
    switch (connection.type) {
      case DataSourceType.ORACLE:
        return this.getOracleSchema();
      
      case DataSourceType.OLAP:
        return this.getOlapSchema();
      
      case DataSourceType.SQL_SERVER:
      case DataSourceType.MYSQL:
      case DataSourceType.POSTGRESQL:
        return this.getSqlSchema();
      
      default:
        return this.getGenericSchema();
    }
  }

  private getOracleSchema(): DataSchema {
    return {
      tables: [
        {
          name: 'SALES_ORDERS',
          schema: 'SALES',
          columns: [
            { name: 'ORDER_ID', type: 'INTEGER' as any, nullable: false },
            { name: 'CUSTOMER_ID', type: 'INTEGER' as any, nullable: false },
            { name: 'ORDER_DATE', type: 'DATE' as any, nullable: false },
            { name: 'TOTAL_AMOUNT', type: 'DECIMAL' as any, nullable: false, precision: 15, scale: 2 },
            { name: 'STATUS', type: 'STRING' as any, nullable: false }
          ],
          primaryKey: ['ORDER_ID'],
          rowCount: 150000,
          description: 'Sales orders table'
        },
        {
          name: 'CUSTOMERS',
          schema: 'SALES',
          columns: [
            { name: 'CUSTOMER_ID', type: 'INTEGER' as any, nullable: false },
            { name: 'CUSTOMER_NAME', type: 'STRING' as any, nullable: false },
            { name: 'EMAIL', type: 'STRING' as any, nullable: true },
            { name: 'REGION', type: 'STRING' as any, nullable: false },
            { name: 'SEGMENT', type: 'STRING' as any, nullable: false }
          ],
          primaryKey: ['CUSTOMER_ID'],
          rowCount: 5000
        }
      ],
      relationships: [
        {
          name: 'FK_SALES_CUSTOMER',
          fromTable: 'SALES_ORDERS',
          fromColumn: 'CUSTOMER_ID',
          toTable: 'CUSTOMERS',
          toColumn: 'CUSTOMER_ID',
          type: 'one_to_many'
        }
      ],
      metadata: {
        version: '12.2.0',
        lastRefresh: new Date().toISOString(),
        totalTables: 2,
        totalColumns: 10,
        dataSourceType: DataSourceType.ORACLE
      }
    };
  }

  private getOlapSchema(): DataSchema {
    return {
      tables: [
        {
          name: 'SalesAnalytics',
          columns: [
            { name: 'Time.Year', type: 'INTEGER' as any, nullable: false, description: 'Year dimension' },
            { name: 'Time.Quarter', type: 'STRING' as any, nullable: false, description: 'Quarter dimension' },
            { name: 'Time.Month', type: 'STRING' as any, nullable: false, description: 'Month dimension' },
            { name: 'Product.Category', type: 'STRING' as any, nullable: false, description: 'Product category' },
            { name: 'Product.Brand', type: 'STRING' as any, nullable: false, description: 'Product brand' },
            { name: 'Customer.Region', type: 'STRING' as any, nullable: false, description: 'Customer region' },
            { name: 'Customer.Segment', type: 'STRING' as any, nullable: false, description: 'Customer segment' },
            { name: 'Measures.SalesAmount', type: 'DECIMAL' as any, nullable: false, description: 'Sales amount measure' },
            { name: 'Measures.Quantity', type: 'INTEGER' as any, nullable: false, description: 'Quantity measure' },
            { name: 'Measures.ProfitMargin', type: 'DECIMAL' as any, nullable: false, description: 'Profit margin measure' }
          ],
          description: 'OLAP cube for sales analytics'
        }
      ],
      relationships: [],
      metadata: {
        version: '1.0',
        lastRefresh: new Date().toISOString(),
        totalTables: 1,
        totalColumns: 10,
        dataSourceType: DataSourceType.OLAP
      }
    };
  }

  private getSqlSchema(): DataSchema {
    return {
      tables: [
        {
          name: 'sales_budget',
          columns: [
            { name: 'id', type: 'INTEGER' as any, nullable: false },
            { name: 'customer_id', type: 'INTEGER' as any, nullable: false },
            { name: 'item_id', type: 'INTEGER' as any, nullable: false },
            { name: 'budget_year', type: 'INTEGER' as any, nullable: false },
            { name: 'budget_month', type: 'INTEGER' as any, nullable: false },
            { name: 'budget_amount', type: 'DECIMAL' as any, nullable: false },
            { name: 'actual_amount', type: 'DECIMAL' as any, nullable: true },
            { name: 'created_at', type: 'DATETIME' as any, nullable: false }
          ],
          primaryKey: ['id'],
          rowCount: 50000
        }
      ],
      relationships: [],
      metadata: {
        version: '1.0',
        lastRefresh: new Date().toISOString(),
        totalTables: 1,
        totalColumns: 8,
        dataSourceType: DataSourceType.SQL_SERVER
      }
    };
  }

  private getGenericSchema(): DataSchema {
    return {
      tables: [],
      relationships: [],
      metadata: {
        version: '1.0',
        lastRefresh: new Date().toISOString(),
        totalTables: 0,
        totalColumns: 0,
        dataSourceType: DataSourceType.REST_API
      }
    };
  }

  async executeQuery(connectionId: string, query: DataQuery): Promise<QueryResult> {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== 'connected') {
      throw new Error('Connection is not active');
    }

    const startTime = Date.now();
    
    // Simulate query execution based on connection type
    const data = await this.simulateQueryExecution(connection, query);
    
    const executionTime = Date.now() - startTime;

    return {
      queryId: query.id,
      data,
      columns: query.resultColumns,
      totalRows: data.length,
      executionTime,
      executedAt: new Date().toISOString()
    };
  }

  private async simulateQueryExecution(connection: DataConnection, query: DataQuery): Promise<any[]> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Generate sample data based on query and connection type
    switch (connection.type) {
      case DataSourceType.ORACLE:
        return this.generateOracleSampleData(query);
      
      case DataSourceType.OLAP:
        return this.generateOlapSampleData(query);
      
      default:
        return this.generateGenericSampleData(query);
    }
  }

  private generateOracleSampleData(query: DataQuery): any[] {
    const sampleData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 50; i++) {
      sampleData.push({
        order_id: 1000 + i,
        customer_id: Math.floor(Math.random() * 100) + 1,
        customer_name: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        order_date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        total_amount: Math.floor(Math.random() * 10000) + 1000,
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        status: ['Active', 'Completed', 'Pending'][Math.floor(Math.random() * 3)]
      });
    }
    
    return sampleData;
  }

  private generateOlapSampleData(query: DataQuery): any[] {
    const sampleData = [];
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
    const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    
    for (let i = 0; i < 100; i++) {
      sampleData.push({
        year: 2024,
        quarter: `Q${Math.floor(Math.random() * 4) + 1}`,
        month: Math.floor(Math.random() * 12) + 1,
        category: categories[Math.floor(Math.random() * categories.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        sales_amount: Math.floor(Math.random() * 100000) + 10000,
        quantity: Math.floor(Math.random() * 1000) + 100,
        profit_margin: (Math.random() * 0.3 + 0.1).toFixed(3)
      });
    }
    
    return sampleData;
  }

  private generateGenericSampleData(query: DataQuery): any[] {
    const sampleData = [];
    
    for (let i = 0; i < 25; i++) {
      const row: any = {};
      query.resultColumns.forEach(col => {
        switch (col.type) {
          case 'INTEGER':
            row[col.name] = Math.floor(Math.random() * 1000);
            break;
          case 'DECIMAL':
            row[col.name] = (Math.random() * 10000).toFixed(2);
            break;
          case 'STRING':
            row[col.name] = `Sample ${i + 1}`;
            break;
          case 'DATE':
            row[col.name] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          default:
            row[col.name] = `Value ${i + 1}`;
        }
      });
      sampleData.push(row);
    }
    
    return sampleData;
  }

  async syncData(connectionId: string): Promise<boolean> {
    const connection = this.getConnection(connectionId);
    if (!connection) return false;

    // Simulate data sync
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update last sync time
        connection.lastSync = new Date().toISOString();
        this.connections.set(connectionId, connection);
        resolve(true);
      }, 2000);
    });
  }

  getConnectionTypes(): Array<{ value: DataSourceType; label: string; description: string }> {
    return [
      {
        value: DataSourceType.ORACLE,
        label: 'Oracle Database',
        description: 'Connect to Oracle database servers'
      },
      {
        value: DataSourceType.OLAP,
        label: 'OLAP Cube',
        description: 'Connect to OLAP cubes for multidimensional analysis'
      },
      {
        value: DataSourceType.SQL_SERVER,
        label: 'SQL Server',
        description: 'Connect to Microsoft SQL Server databases'
      },
      {
        value: DataSourceType.MYSQL,
        label: 'MySQL',
        description: 'Connect to MySQL databases'
      },
      {
        value: DataSourceType.POSTGRESQL,
        label: 'PostgreSQL',
        description: 'Connect to PostgreSQL databases'
      },
      {
        value: DataSourceType.POWER_BI,
        label: 'Power BI',
        description: 'Connect to Microsoft Power BI workspaces'
      },
      {
        value: DataSourceType.TABLEAU,
        label: 'Tableau',
        description: 'Connect to Tableau servers'
      },
      {
        value: DataSourceType.REST_API,
        label: 'REST API',
        description: 'Connect to RESTful web services'
      },
      {
        value: DataSourceType.CSV_FILE,
        label: 'CSV File',
        description: 'Import data from CSV files'
      },
      {
        value: DataSourceType.EXCEL_FILE,
        label: 'Excel File',
        description: 'Import data from Excel files'
      }
    ];
  }
}

export const dataConnector = new DataConnector();
