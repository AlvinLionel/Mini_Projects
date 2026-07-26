#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include <windows.h>
#include <errno.h>
// #include <openssl.sha.h>

#define MAX_USERS 500
#define MAX_TRANSACTIONS 500

typedef struct
{
    int userId;
    char fullName[100];
    char username[50];
    char password[50];
    double balance;
    char createdAt[20];
    char lastLogin[20]; // include this feature then update the data in the file
    double phoneNumber; // include mobile money transfers with otp
    bool isActive;
} Users;

typedef struct
{
    int userId;
    char transactionId[50];
    char type[50];
    double amount;
    int receiverId;
    char timestamp[20];
} Transactions;

Users user[MAX_USERS];
Transactions transaction[MAX_TRANSACTIONS];

int userCount = 0, transactionCount = 0;

void getTimestamp(char *buffer, size_t size)
{
    time_t now = time(NULL);
    struct tm *local = localtime(&now);
    strftime(buffer, size, "%Y-%m-%d %H:%M:%S", local);
}

void sanitizeString(char *str)
{

    str[strcspn(str, "\n")] = '\0';

    int len = strlen(str);
    while (len > 0 && isspace((unsigned char)str[len - 1]))
    {
        str[--len] = '\0';
    }

    char *start = str;
    while (isspace((unsigned char)*start))
        start++;

    if (start != str)
    {
        memmove(str, start, strlen(start) + 1);
    }
}

void saveUsers()
{
    FILE *file = fopen("./Users.txt", "w");
    if (file == NULL)
    {
        perror("User file opening during save unsuccessfull");
        exit(1);
    }
    for (int i = 0; i < userCount; i++)
    {
        sanitizeString(user[i].createdAt);
        user[i].isActive = true;
        fprintf(file, "User %d= { %d | %s | %s | %s | %lf | %s | %s }\n", i + 1, user[i].userId, user[i].fullName, user[i].username, user[i].password, user[i].balance, user[i].isActive ? "true" : "false", user[i].createdAt);
    }
    fclose(file);
}

void loadUsers()
{
    FILE *file = fopen("./Users.txt", "r");
    if (file == NULL)
    {
        if (errno == ENOENT)
        {
            file = fopen("./Users.txt", "w");
            if (file == NULL)
            {
                perror("User file creation during load failed");
                exit(1);
            }
            fclose(file);
            file = fopen("./Users.txt", "r");
        }
        else
        {
            perror("User file opening during load unsuccessfull");
            exit(1);
        }
    }
    char status[10];
    while (fscanf(file, "User %*d= { %d | %[^|] | %[^|] | %[^|] | %lf | %[^|] | %[^}] }\n", &user[userCount].userId, user[userCount].fullName, user[userCount].username, user[userCount].password, &user[userCount].balance, status, user[userCount].createdAt) != EOF)
    {
        user[userCount].isActive = (strcmp(status, "true") == 0) ? true : false;
        sanitizeString(user[userCount].fullName);
        sanitizeString(user[userCount].username);
        sanitizeString(user[userCount].password);
        userCount++;
    }
    fclose(file);
}

void saveTransactions()
{
    FILE *file = fopen("./Transactions.txt", "w");
    if (file == NULL)
    {
        perror("Transaction file opening during save unsuccessfull");
        exit(1);
    }
    for (int i = 0; i < transactionCount && i < MAX_TRANSACTIONS; i++)
    {
        if (strcmp(transaction[i].type, "Transfer") == 0)
        {
            fprintf(file, "Transaction %d= { %s | %d | %s | %lf | %s | %d }\n", i + 1, transaction[i].transactionId, transaction[i].userId, transaction[i].type, transaction[i].amount, transaction[i].timestamp, transaction[i].receiverId);
        }
        else
        {
            fprintf(file, "Transaction %d= { %s | %d | %s | %lf | %s }\n", i + 1, transaction[i].transactionId, transaction[i].userId, transaction[i].type, transaction[i].amount, transaction[i].timestamp);
        }
    }
    fclose(file);
}

void loadTransactions()
{
    FILE *file = fopen("./Transactions.txt", "r");
    if (file == NULL)
    {
        if (errno == ENOENT)
        {
            file = fopen("./Transactions.txt", "w");
            if (file == NULL)
            {
                perror("Transaction file creation during load failed");
                exit(1);
            }
            fclose(file);
            file = fopen("./Transactioons.txt", "r");
        }
        else
        {
            perror("Transaction file opening during load unsuccessfull");
            exit(1);
        }
    }

    char line[256];
    transactionCount = 0;

    while (fgets(line, sizeof(line), file) != NULL)
    {
        char tempType[50];
        int matched;

        matched = sscanf(line, "Transaction %*d= { %49[^|] | %d | %49[^|] | %lf | %19[^|] | %d }", transaction[transactionCount].transactionId, &transaction[transactionCount].userId, tempType, &transaction[transactionCount].amount, transaction[transactionCount].timestamp, &transaction[transactionCount].receiverId);

        if (matched == 6)
        {
            strcpy(transaction[transactionCount].type, tempType);
        }
        else
        {
            matched = sscanf(line, "Transaction %*d= { %49[^|] | %d | %49[^|] | %lf | %19[^}] }", transaction[transactionCount].transactionId, &transaction[transactionCount].userId, tempType, &transaction[transactionCount].amount, transaction[transactionCount].timestamp);
            if (matched == 5)
            {
                strcpy(transaction[transactionCount].type, tempType);
                transaction[transactionCount].receiverId = -1;
            }
            else
            {
                continue;
            }
        }

        sanitizeString(transaction[transactionCount].transactionId);
        sanitizeString(transaction[transactionCount].type);
        sanitizeString(transaction[transactionCount].timestamp);

        transactionCount++;
        if (transactionCount >= MAX_TRANSACTIONS)
        {
            fprintf(stderr, "Too many transactions. Increase MAX_TRANSACTIONS.\n");
            break;
        }
    }

    fclose(file);
}

void lowerstring(char *str)
{
    for (int i = 0; i < strlen(str); i++)
    {
        if (isupper(str[i]))
        {
            str[i] = tolower(str[i]);
        }
    }
}

int generateUserID()
{
    int newId;
    bool exists;

    static bool seeded = false;
    if (!seeded)
    {
        srand(time(NULL));
        seeded = true;
    }
    do
    {
        newId = rand() % 90000 + 10000;
        exists = false;
        for (int i = 0; i < userCount; i++)
        {
            if (user[i].userId == newId)
            {
                exists = true;
                break;
            }
        }
    } while (exists);

    return newId;
}

void generateTransactionId(char *buffer, size_t size)
{
    static bool seeded = false;
    if (!seeded)
    {
        srand((unsigned int)time(NULL));
        seeded = true;
    }

    const char prefix[] = "TRX";
    const char charset[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    int length = 6;

    bool exists;
    do
    {
        snprintf(buffer, size, "%s", prefix);

        for (int i = 0; i < length && (strlen(prefix) + i) < size - 1; i++)
        {
            buffer[strlen(prefix) + i] = charset[rand() % (sizeof(charset) - 1)];
        }

        buffer[strlen(prefix) + length] = '\0';

        exists = false;
        for (int i = 0; i < transactionCount; i++)
        {
            if (strcmp(transaction[i].transactionId, buffer) == 0)
            {
                exists = true;
                break;
            }
        }

    } while (exists);
}

void createAccount()
{
    if (userCount >= MAX_USERS)
    {
        printf("User limit reached. Cannot create more accounts.\n");
        return;
    }

    printf("Enter your full name: ");
    fgets(user[userCount].fullName, sizeof(user[userCount].fullName), stdin);
    user[userCount].fullName[strcspn(user[userCount].fullName, "\n")] = '\0';

    char username[50];
    bool isUnique;
    do
    {
        printf("Enter your username: ");
        fgets(username, sizeof(username), stdin);
        username[strcspn(username, "\n")] = '\0';

        isUnique = true;
        for (int i = 0; i < userCount; i++)
        {
            if (strcmp(user[i].username, username) == 0)
            {
                printf("Username already exists. Please select another.\n");
                isUnique = false;
                break;
            }
        }
    } while (!isUnique);
    strcpy(user[userCount].username, username);

    printf("Enter your desired password: ");
    fgets(user[userCount].password, sizeof(user[userCount].password), stdin);
    user[userCount].password[strcspn(user[userCount].password, "\n")] = '\0';

    user[userCount].userId = generateUserID();
    user[userCount].balance = 0.0;
    getTimestamp(user[userCount].createdAt, sizeof(user[userCount].createdAt));
    user[userCount].isActive = true;
    userCount++;
    saveUsers();
    printf("Account created successfully!\n");
}

void deposit(const int userId)
{
    double amount;
    char password[50], choice[10];
    bool correctPassword = false;

    printf("Enter the amount you wish to deposit: ");
    scanf("%lf", &amount);
    getchar();
    printf("Enter your password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId)
        {
            if (strcmp(user[i].password, password) == 0)
            {
                correctPassword = true;
                printf("You are about to deposit %.2lf into your account, continue? (yes/no): ", amount);
                scanf("%s", choice);
                lowerstring(choice);
                if (strcmp(choice, "yes") == 0)
                {
                    user[i].balance += amount;
                    transaction[transactionCount].userId = userId;
                    strcpy(transaction[transactionCount].type, "Deposit");
                    transaction[transactionCount].amount = amount;
                    getTimestamp(transaction[transactionCount].timestamp, sizeof(transaction[transactionCount].timestamp));
                    generateTransactionId(transaction[transactionCount].transactionId, sizeof(transaction[transactionCount].transactionId));
                    printf("\nDeposit successful, transaction ID: %s!\nYour new balance is %.2lf\n", transaction[transactionCount].transactionId, user[i].balance);
                    transactionCount++;
                    saveTransactions();
                    break;
                }
                else
                {
                    printf("Deposit cancelled\n");
                    break;
                }
            }
        }
    }
    if (!correctPassword)
    {
        printf("Invalid password. Please try again.\n");
    }
}

void withdraw(const int userId)
{
    double amount;
    char choice[10], password[50];
    bool correctPassword;

    printf("Enter the amount you wish to withdraw: ");
    scanf("%lf", &amount);
    getchar();
    printf("Enter your password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';
    correctPassword = false;

    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId && strcmp(user[i].password, password) == 0)
        {
            correctPassword = true;
            if (user[i].balance < amount)
            {
                printf("Insufficient balance for withdrawal.\n");
                return;
            }
            printf("You are about to withdraw %.2lf, continue (yes/no)? ", amount);
            scanf("%s", choice);
            lowerstring(choice);

            if (strcmp(choice, "yes") == 0)
            {
                user[i].balance -= amount;
                transaction[transactionCount].amount = amount;
                transaction[transactionCount].userId = userId;
                strcpy(transaction[transactionCount].type, "Withdrawal");
                getTimestamp(transaction[transactionCount].timestamp, sizeof(transaction[transactionCount].timestamp));
                generateTransactionId(transaction[transactionCount].transactionId, sizeof(transaction[transactionCount].transactionId));
                printf("\nWithdraw successful,transaction ID: %s!\nYour new balance is %.2lf\n", transaction[transactionCount].transactionId, user[i].balance);
                saveUsers();
                saveTransactions();
                transactionCount++;
                break;
            }
            else
            {
                printf("Withdraw cancelled.\n");
                break;
            }
        }
    }
    if (!correctPassword)
    {
        printf("Invalid password. Please try again.\n");
    }
}

void transfer(const int userId)
{
    char choice[10], password[50], receiver[30];
    double amount;
    bool receiverFound = false, correctPassword = false;

    for (int j = 0; j < userCount; j++)
    {
        if (user[j].userId == userId)
        {
            getchar();
            printf("Enter the username of the receiver: ");
            fgets(receiver, sizeof(receiver), stdin);
            receiver[strcspn(receiver, "\n")] = '\0';

            for (int i = 0; i < userCount; i++)
            {
                if (strcmp(user[i].username, receiver) == 0)
                {
                    receiverFound = true;
                    char firstName[30];
                    sscanf(user[i].fullName, "%s", firstName);

                    printf("Enter the amount you wish to transfer: ");
                    scanf("%lf", &amount);
                    getchar();

                    printf("Please enter your password: ");
                    fgets(password, sizeof(password), stdin);
                    password[strcspn(password, "\n")] = '\0';

                    if (strcmp(user[j].password, password) == 0)
                    {
                        correctPassword = true;

                        if (amount > user[j].balance)
                        {
                            printf("Insufficient balance for transfer.\n");
                            return;
                        }

                        printf("You are about to transfer %.2lf to %s, continue (yes/no)? ", amount, firstName);
                        scanf("%s", choice);
                        lowerstring(choice);

                        if (strcmp(choice, "yes") == 0)
                        {
                            user[j].balance -= amount;
                            user[i].balance += amount;

                            transaction[transactionCount].amount = amount;
                            transaction[transactionCount].userId = userId;
                            transaction[transactionCount].receiverId = user[i].userId;
                            strcpy(transaction[transactionCount].type, "Transfer");
                            getTimestamp(transaction[transactionCount].timestamp, sizeof(transaction[transactionCount].timestamp));
                            generateTransactionId(transaction[transactionCount].transactionId, sizeof(transaction[transactionCount].transactionId));

                            printf("\nTransfer successful! Your new balance is %.2lf\n", user[j].balance);
                            printf("Transaction ID: %s\n", transaction[transactionCount].transactionId);

                            saveUsers();
                            saveTransactions();
                            transactionCount++;
                            break;
                        }
                        else
                        {
                            printf("Transfer cancelled.\n");
                            break;
                        }
                    }
                }
            }
            break;
        }
    }

    if (!receiverFound)
    {
        printf("Invalid receiver username.\n");
    }
    else if (!correctPassword)
    {
        printf("Invalid password. Please try again.\n");
    }
}

void checkBalance(const int userId)
{
    char password[50];
    bool correctPassword = false;
    getchar();
    printf("Please enter your password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId && strcmp(user[i].password, password) == 0)
        {
            correctPassword = true;
            printf("Your current balance is: %.2lf\n", user[i].balance);
            return;
        }
    }
}

void transactionHistory(const int userId)
{
    char password[50];
    bool correctPassword = false;
    getchar();
    printf("Please enter your password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId && strcmp(user[i].password, password) == 0)
        {
            correctPassword = true;
            printf("Transaction history for %s:\n", user[i].username);
            for (int j = 0; j < transactionCount; j++)
            {
                if (transaction[j].userId == userId)
                {
                    printf("\nTransaction %d:\n\t Transaction ID: %s\n\t Amount: %.2lf\n\t Type: %s\n\t Transaction Date: %s\n", j + 1, transaction[j].transactionId, transaction[j].amount, transaction[j].type, transaction[j].timestamp);
                    if (strcmp(transaction[j].type, "Transfer") == 0)
                    {
                        for (int k = 0; k < userCount; k++)
                        {
                            if (user[k].userId == transaction[j].receiverId)
                            {
                                printf("\t Receiver: %s\n", user[k].username);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    if (!correctPassword)
    {
        printf("Invalid password, please try again\n");
    }
}

void loansAndSavings(const int userId)
{
    printf("Welcome to the loans and savings section.\n");
}

void accountDetails(const int userId)
{
    char password[50];
    bool correctPassword = false;
    getchar();
    printf("Please enter your password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    for (int i = 0; i < userCount; i++)
    {
        if (strcmp(user[i].password, password) == 0)
        {
            correctPassword = true;
            printf("\nUser Id: %d\nFull name: %s\nUsername: %s\nAccount Balance: %.2lf\nStatus: %s\n", user[i].userId, user[i].fullName, user[i].username, user[i].balance, user[i].isActive ? "Active" : "Inactive");
        }
    }
    if (!correctPassword)
    {
        printf("Invalid password, Please try again.\n");
    }
}

void Auth_AccountDetails(const int userId)
{
    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId)
        {
            printf("\nUser Id: %d\nFull name: %s\nUsername: %s\nAccount Balance: %.2lf\nStatus: %s\n", user[i].userId, user[i].fullName, user[i].username, user[i].balance, user[i].isActive ? "Active" : "Inactive");
        }
    }
}

void deleteUser(int userId)
{
    FILE *file = fopen("./newUsers.txt", "r");
    if (file == NULL)
    {
        perror("Error opening file");
        exit(1);
    }
    fseek(file, 0, SEEK_END);
    long fileSize = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *buffer = (char *)malloc(fileSize + 1);
    if (buffer == NULL)
    {
        perror("Memory allocation failed");
        fclose(file);
        exit(1);
    }

    fread(buffer, 1, fileSize, file);
    buffer[fileSize] = '\0';
    fclose(file);

    file = fopen("./newUsers.txt", "w");
    if (file == NULL)
    {
        perror("Error opening file");
        free(buffer);
        exit(1);
    }
    char *line = strtok(buffer, "\n");
    while (line != NULL)
    {
        int id;
        sscanf(line, "User %*d= { %d |", &id);
        if (id != userId)
        {
            fprintf(file, "%s\n", line);
        }
        line = strtok(NULL, "\n");
    }
    free(buffer);
    fclose(file);
}

void deleteTransactions(int userId)
{
    FILE *file = fopen("./newTransactions.txt", "r");
    if (file == NULL)
    {
        perror("Error opening file");
        return;
    }
    fseek(file, 0, SEEK_END);
    long fileSize = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *buffer = (char *)malloc(fileSize + 1);
    if (buffer == NULL)
    {
        perror("Memory allocation failed");
        fclose(file);
        return;
    }

    fread(buffer, 1, fileSize, file);
    buffer[fileSize] = '\0';
    fclose(file);

    file = fopen("./newTransactions.txt", "w");
    if (file == NULL)
    {
        perror("Error opening file");
        free(buffer);
        return;
    }
    char *line = strtok(buffer, "\n");
    while (line != NULL)
    {
        int id;
        if (sscanf(line, "Transaction %*d= { %*[^|] | %d |", &id) == 1)
        {
            if (id != userId)
            {
                fprintf(file, "%s\n", line);
            }
        }
        else
        {
            fprintf(file, "%s\n", line);
        }
        line = strtok(NULL, "\n");
    }
    free(buffer);
    fclose(file);
}

void deleteAccount()
{
    int userId;
    printf("Enter the user ID of the account you wish to delete: ");
    scanf("%d", &userId);
    bool userFound = false;
    char choice[10];

    for (int i = 0; i < userCount; i++)
    {
        if (user[i].userId == userId)
        {
            userFound = true;
            printf("This process is irreversible, do you wish to proceed? (yes/no): ");
            scanf("%s", choice);
            lowerstring(choice);
            if (strcmp(choice, "yes") == 0)
            {
                deleteUser(userId);
                deleteTransactions(userId);
                userCount = 0;
                transactionCount = 0;
                loadUsers();
                loadTransactions();
                printf("Account deleted successfully.\n");
                return;
            }
            else
            {
                printf("Account deletion cancelled.\n");
                return;
            }
        }
    }
    if (!userFound)
    {
        printf("User not found.\n");
    }
}

void authorizedAccess()
{
    char password[20];
    bool correctPassword;
    int passwordTrials = 0;

    while (passwordTrials < 3)
    {
        printf("Enter the system password: ");
        fgets(password, sizeof(password), stdin);
        password[strcspn(password, "\n")] = '\0';
        passwordTrials++;

        correctPassword = false;
        if (strcmp("Banking", password) == 0)
        {
            correctPassword = true;
            printf("\nAccess granted.\n");
            int choice;

            while (1)
            {
                printf("\n1. Show Users\n");
                printf("2. Show Transactions\n");
                printf("3. View account\n");
                printf("4. Delete account\n");
                printf("5. Exit\n");
                printf("Enter your choice: ");
                scanf("%d", &choice);

                switch (choice)
                {
                case 1:
                    char timestamp[30];
                    getTimestamp(timestamp, sizeof(timestamp));
                    printf("There are %d users in the system as at %s\n", userCount, timestamp);

                    for (int i = 0; i < userCount; i++)
                    {
                        printf("\nUser %d\n \tUserId: %d\n \tUser fullname: %s\n \tUsername: %s\n \tAccount Balance: %.2lf\n \tAccount Password: %s\n \tCreation date: %s\n", i + 1, user[i].userId, user[i].fullName, user[i].username, user[i].balance, user[i].password, user[i].createdAt);
                    }
                    break;
                case 2:
                    char timestamp2[30];
                    getTimestamp(timestamp2, sizeof(timestamp2));
                    printf("%d transactions have been performed in the system as at %s", transactionCount, timestamp2);
                    for (int i = 0; i < transactionCount; i++)
                    {
                        printf("\nTransaction %d\n \tUser ID: %d\n \tTransaction ID: %s\n \tTransaction date: %s\n \tTransaction type: %s\n", i + 1, transaction[i].userId, transaction[i].transactionId, transaction[i].timestamp, transaction[i].type);
                        if (strcmp(transaction[i].type, "Transfer") == 0)
                        {
                            for (int j = 0; j < userCount; j++)
                            {
                                if (user[j].userId == transaction[i].receiverId)
                                {
                                    printf("\t Receiver: %s\n", user[j].username);
                                    break;
                                }
                            }
                        }
                    }
                    break;
                case 3:
                    int userId;
                    printf("Enter the userId of the account you wish to view: ");
                    scanf("%d", &userId);
                    for (int i = 0; i < userCount; i++)
                    {
                        if (user[i].userId == userId)
                        {
                            Auth_AccountDetails(userId);
                            break;
                        }
                        else if (i == userCount - 1)
                        {
                            printf("User with ID %d not found.\n", userId);
                            break;
                        }
                    }
                    break;
                case 4:
                    deleteAccount();
                    break;
                case 5:
                    printf("Exiting...\n");
                    Sleep(1000);
                    return;
                    break;
                default:
                    break;
                }
            }
        }
    }
    if (!correctPassword)
    {
        printf("Invalid system password, you have %d trials remaining.\n", 3 - passwordTrials);
    }
}

void userAuthentication()
{
    char password[50], username[50];
    bool authenticated = false;
    int userIndex = -1, passwordTrials = 0;

    printf("Enter your username: ");
    fgets(username, sizeof(username), stdin);
    username[strcspn(username, "\n")] = '\0';

    for (int i = 0; i < userCount; i++)
    {
        if (strcmp(username, user[i].username) == 0)
        {
            userIndex = i;
            break;
        }
    }
    if (userIndex == -1)
    {
        printf("Invalid username, please try again.\n");
        return;
    }
    while (passwordTrials < 3)
    {
        printf("Enter your password: ");
        fgets(password, sizeof(password), stdin);
        password[strcspn(password, "\n")] = '\0';
        passwordTrials++;

        if (strcmp(user[userIndex].password, password) == 0)
        {
            authenticated = true;
            char firstname[20];
            sscanf(user[userIndex].fullName, "%s", firstname);

            printf("Welcome %s!\n", firstname);
            int userId = user[userIndex].userId;
            while (1)
            {
                int choice;
                printf("\n1. Deposit\n");
                printf("2. Withdraw\n");
                printf("3. Transfer\n");
                printf("4. Check Balance\n");
                printf("5. Transaction History\n");
                printf("6. Loans and Savings\n");
                printf("7. Account Details\n");
                printf("8. Log Out\n");
                printf("\nEnter your choice: ");
                scanf("%d", &choice);

                switch (choice)
                {
                case 1:
                    deposit(userId);
                    break;
                case 2:
                    withdraw(userId);
                    break;
                case 3:
                    transfer(userId);
                    break;
                case 4:
                    checkBalance(userId);
                    break;
                case 5:
                    transactionHistory(userId);
                    break;
                case 6:
                    printf("Loans and savings not implemented yet.\n");
                    break;
                case 7:
                    accountDetails(userId);
                    break;
                case 8:
                    printf("Logging out...");
                    return;
                default:
                    printf("Invalid choice, please try again.\n");
                    break;
                }
            }
        }
        else
        {
            printf("Invalid password, %d trials remaining.\n", 3 - passwordTrials);
            if (passwordTrials >= 3)
            {
                printf("Password trials exceeded, please try again later.\n");
                return;
            }
        }
    }
}

int main()
{
    loadUsers();
    loadTransactions();

    while (1)
    {
        char input[20];
        printf("\n1. Create Account\n");
        printf("2. Login\n");
        printf("3. Exit\n");
        printf("\nEnter your choice: ");
        fgets(input, sizeof(input), stdin);
        input[strcspn(input, "\n")] = '\0';

        if (strcmp(input, "root@system") != 0)
        {
            int choice = atoi(input);
            switch (choice)
            {
            case 1:
                createAccount();
                break;
            case 2:
                userAuthentication();
                break;
            case 3:
                printf("Exiting...\n");
                Sleep(1000);
                saveUsers();
                saveTransactions();
                exit(0);
                break;
            default:
                printf("Invalid choice. Please try again.\n");
                break;
            }
        }
        else
        {
            printf("\nDecrypting system vault");
            for (int i = 0; i < 5; i++)
            {
                Sleep(500);
                printf(".");
                fflush(stdout);
                Beep(1000, 200);
            }

            printf("\n");
            printf("Access granted. Welcome to the system admin panel.\n");
            char sysPassword[20];
            printf("\nEnter the system password: ");
            fgets(sysPassword, sizeof(sysPassword), stdin);
            sysPassword[strcspn(sysPassword, "\n")] = '\0';

            if (strcmp(sysPassword, "Backend_Pass") == 0)
            {
                int choice;
                printf("\n1. System infomation\n");
                printf("2. Delete Account\n");
                printf("3. Exit\n");
                printf("\nEnter your choice: ");
                scanf("%d", &choice);
                getchar();

                switch (choice)
                {
                case 1:
                    authorizedAccess();
                    break;
                case 2:
                    deleteAccount();
                    break;
                case 3:
                    printf("Exiting...\n");
                    Sleep(1000);
                    saveUsers();
                    saveTransactions();
                    exit(0);
                default:
                    printf("Invalid choice. Please try again.\n");
                    break;
                }
            }
            else
            {
                printf("Incorrect system password.\n");
                continue;
            }
        }
    }

    return 0;
}
// Include loans and savings features
// Hash passwords
// Include mobile money transfers otp
// Include a feature to view the last access time of an account
// Include a backup file for both users and transactions
// Consider adding account numbers for the users and using it for funds transfer and also allow a single user to posess multiple accounts. Include a feature where as users login they select the account in which they want to operate