using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Infrastructure.Persistence;

public class DapperContext : IDapperContext
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("DefaultConnection")!;
    }

    public IDbConnection CreateConnection()
        => new SqlConnection(_connectionString);
}