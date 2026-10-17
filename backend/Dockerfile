# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["src/FinanceTracker.Api/FinanceTracker.Api.csproj", "src/FinanceTracker.Api/"]
RUN dotnet restore "src/FinanceTracker.Api/FinanceTracker.Api.csproj"

# Copy source code and compile Release build
COPY src/ src/
WORKDIR "/src/src/FinanceTracker.Api"
RUN dotnet publish "FinanceTracker.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5050
ENV ASPNETCORE_URLS=http://+:5050

USER $APP_UID
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FinanceTracker.Api.dll"]
