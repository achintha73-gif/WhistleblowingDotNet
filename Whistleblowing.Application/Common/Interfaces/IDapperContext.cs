using System.Data;

namespace Whistleblowing.Application.Common.Interfaces;

public interface IDapperContext
{
    IDbConnection CreateConnection();
}