def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'
def expectedContainers = ['user-microservice-container', 'product-microservice-container', 'media-microservice-container', 'order-microservice-container',
                        'user-mongodb-container', 'product-mongodb-container', 'media-mongodb-container', 'order-mongodb-container',
                        'frontend-container', 'kafka-container', 'zookeeper-container']

pipeline {
    agent any // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    environment {
        USER_MICROSERVICE_IMAGE = 'danglamgritlab/user-microservice:latest'
        PRODUCT_MICROSERVICE_IMAGE = 'danglamgritlab/product-microservice:latest'
        MEDIA_MICROSERVICE_IMAGE = 'danglamgritlab/media-microservice:latest'
        ORDER_MICROSERVICE_IMAGE = 'danglamgritlab/order-microservice:latest'
        FRONTEND_IMAGE = 'danglamgritlab/frontend:latest'
        NEXUS_VERSION = "nexus3"
        NEXUS_PROTOCOL = "http"
        NEXUS_URL = "http://209.38.204.141:9001/"
        NEXUS_REPOSITORY = "maven-snapshots"
        NEXUS_CREDENTIAL_ID = "nexus-creds"
    }

    stages {
        stage('Setup Credentials') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(credentialsId: 'user-mongodb-creds', usernameVariable: 'USER_DB_USERNAME', passwordVariable: 'USER_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'product-mongodb-creds', usernameVariable: 'PRODUCT_DB_USERNAME', passwordVariable: 'PRODUCT_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'media-mongodb-creds', usernameVariable: 'MEDIA_DB_USERNAME', passwordVariable: 'MEDIA_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'order-mongodb-creds', usernameVariable: 'ORDER_DB_USERNAME', passwordVariable: 'ORDER_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD'),
                        string(credentialsId: 'jwt-secret-creds', variable: 'JWT_SECRET')
                    ]) {
                        env.USER_DB_USERNAME = USER_DB_USERNAME
                        env.USER_DB_PASSWORD = USER_DB_PASSWORD
                        env.PRODUCT_DB_USERNAME = PRODUCT_DB_USERNAME
                        env.PRODUCT_DB_PASSWORD = PRODUCT_DB_PASSWORD
                        env.MEDIA_DB_USERNAME = MEDIA_DB_USERNAME
                        env.MEDIA_DB_PASSWORD = MEDIA_DB_PASSWORD
                        env.ORDER_DB_USERNAME = ORDER_DB_USERNAME
                        env.ORDER_DB_PASSWORD = ORDER_DB_PASSWORD
                        env.NEXUS_USERNAME = NEXUS_USERNAME
                        env.NEXUS_PASSWORD = NEXUS_PASSWORD
                        env.JWT_SECRET_VALUE = JWT_SECRET
                        env.PATH = "/home/danglam/.nvm/versions/node/v18.10.0/bin:${env.PATH}"
                    }
                }
            }
        }

        stage('Clean Workspace') {
            agent { label 'build-agent' }
            steps {
                script {
                    sh 'find . -name "report-task.txt" -exec rm {} +'
                }
            }
        }

        stage('SonarQube Analysis for User-Microservice') {
            agent { label 'build-agent' }
            steps {
                echo "SonarQube Analysis for User-Microservice has been started."
                withSonarQubeEnv('SonarQube Server') {
                    sh """
                    cd backend/user
                    mvn clean verify sonar:sonar
                    """
                }
                echo "SonarQube Analysis for User-Microservice has been completed."
            }
        }

        stage("Quality Gate for User-Microservice") {
            agent { label 'build-agent' }
            steps {
                waitForQualityGate abortPipeline: true
                sh 'find . -name "report-task.txt" -exec rm {} +'
                echo "Quality Gate for User-Microservice has been completed."
            }
        }

        stage('SonarQube Analysis for Product-Microservice') {
            agent { label 'build-agent' }
            steps {
                echo "SonarQube Analysis for Product-Microservice has been started."
                withSonarQubeEnv('SonarQube Server') {
                    sh """
                    cd backend/product
                    mvn clean verify sonar:sonar
                    """
                }
                echo "SonarQube Analysis for Product-Microservice has been completed."
            }
        }

        stage("Quality Gate for Product-Microservice") {
            agent { label 'build-agent' }
            steps {
                waitForQualityGate abortPipeline: true
                sh 'find . -name "report-task.txt" -exec rm {} +'
                echo "Quality Gate for Product-Microservice has been completed."
            }
        }

        stage('SonarQube Analysis for Media-Microservice') {
            agent { label 'build-agent' }
            steps {
                echo "SonarQube Analysis for Media-Microservice has been started."
                withSonarQubeEnv('SonarQube Server') {
                    sh """
                    cd backend/media
                    mvn clean verify sonar:sonar
                    """
                }
                echo "SonarQube Analysis for Media-Microservice has been completed."
            }
        }

        stage("Quality Gate for Media-Microservice") {
            agent { label 'build-agent' }
            steps {
                waitForQualityGate abortPipeline: true
                sh 'find . -name "report-task.txt" -exec rm {} +'
                echo "Quality Gate for Media-Microservice has been completed."
            }
        }

        stage('SonarQube Analysis for Order-Microservice') {
            agent { label 'build-agent' }
            steps {
                echo "SonarQube Analysis for Order-Microservice has been started."
                withSonarQubeEnv('SonarQube Server') {
                    sh """
                    cd backend/order
                    mvn clean verify sonar:sonar
                    """
                }
                echo "SonarQube Analysis for Order-Microservice has been completed."
            }
        }

        stage("Quality Gate for Order-Microservice") {
            agent { label 'build-agent' }
            steps {
                waitForQualityGate abortPipeline: true
                sh 'find . -name "report-task.txt" -exec rm {} +'
                echo "Quality Gate for Order-Microservice has been completed."
            }
        }

        stage('SonarQube Analysis for Frontend') {
            agent { label 'build-agent' }
            steps {
                echo "SonarQube analysis for Frontend has been started."
                withSonarQubeEnv('SonarQube Server') {
                    sh """
                    cd frontend
                    npm install
                    sonar-scanner
                    """
                }
                echo "SonarQube analysis for Frontend has been completed."
            }
        }

        /*stage("Quality Gate for Frontend") {
            agent { label 'build-agent' }
            steps {
                waitForQualityGate abortPipeline: true
                sh 'find . -name "report-task.txt" -exec rm {} +'
                echo "Quality Gate for Frontend has been completed."
            }
        }

        stage('Frontend Unit Tests') {
            agent { label 'build-agent' }
            steps {
                sh '''
                cd frontend
                ng test --watch=false --browsers ChromeHeadless
                '''
            }
        }*/

        stage('Build') {
            agent { label 'build-agent' } // This stage will be executed on the 'build' agent
            steps {
                script {
                    // Define the variables to be masked
                    def maskVars = [
                        [var: 'USER_DB_USERNAME', password: env.USER_DB_USERNAME],
                        [var: 'USER_DB_PASSWORD', password: env.USER_DB_PASSWORD],
                        [var: 'PRODUCT_DB_USERNAME', password: env.PRODUCT_DB_USERNAME],
                        [var: 'PRODUCT_DB_PASSWORD', password: env.PRODUCT_DB_PASSWORD],
                        [var: 'MEDIA_DB_USERNAME', password: env.MEDIA_DB_USERNAME],
                        [var: 'MEDIA_DB_PASSWORD', password: env.MEDIA_DB_PASSWORD],
                        [var: 'ORDER_DB_USERNAME', password: env.ORDER_DB_USERNAME],
                        [var: 'ORDER_DB_PASSWORD', password: env.ORDER_DB_PASSWORD],
                        [var: 'JWT_SECRET_VALUE', password: env.JWT_SECRET_VALUE]
                    ]

                    // Use maskPasswords with named arguments
                    maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                        // Execute the build commands
                        sh '''
                        docker system prune -a -f --volumes

                        cd backend

                        docker build -t user-microservice -f user/Dockerfile \
                            --build-arg USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME \
                            --build-arg USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag user-microservice $USER_MICROSERVICE_IMAGE
                        docker push $USER_MICROSERVICE_IMAGE

                        docker build -t product-microservice -f product/Dockerfile \
                            --build-arg PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME \
                            --build-arg PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag product-microservice $PRODUCT_MICROSERVICE_IMAGE
                        docker push $PRODUCT_MICROSERVICE_IMAGE

                        docker build -t media-microservice -f media/Dockerfile \
                            --build-arg MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME \
                            --build-arg MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag media-microservice $MEDIA_MICROSERVICE_IMAGE
                        docker push $MEDIA_MICROSERVICE_IMAGE

                        docker build -t order-microservice -f order/Dockerfile \
                            --build-arg ORDER_DB_CREDENTIALS_USERNAME=$ORDER_DB_USERNAME \
                            --build-arg ORDER_DB_CREDENTIALS_PASSWORD=$ORDER_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag order-microservice $ORDER_MICROSERVICE_IMAGE
                        docker push $ORDER_MICROSERVICE_IMAGE

                        cd ../frontend
                        docker build -t frontend .
                        docker tag frontend $FRONTEND_IMAGE
                        docker push $FRONTEND_IMAGE

                        docker system prune -a -f --volumes
                        '''
                    }
                }
            }
        }

        stage('Deploy Artifacts to Nexus') {
            agent { label 'build-agent' }
            steps {
                script {
                    sh '''
                    cd backend/user
                    '''
                    nexusArtifactUploader(
                        nexusVersion: NEXUS_VERSION,
                        protocol: NEXUS_PROTOCOL,
                        nexusUrl: NEXUS_URL,
                        groupId: "com.gritlab",
                        version: "1.0-SNAPSHOT",
                        repository: NEXUS_REPOSITORY,
                        credentialsId: NEXUS_CREDENTIAL_ID,
                        artifacts: [
                            [artifactId: "user",
                            classifier: '',
                            file: "./target/user.jar",
                            type: "jar"],
                            [artifactId: "user",
                            classifier: '',
                            file: "pom.xml",
                            type: "pom"]
                        ]
                    );
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy-agent' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Define the variables to be masked
                    def maskVars = [
                        [var: 'USER_DB_USERNAME', password: env.USER_DB_USERNAME],
                        [var: 'USER_DB_PASSWORD', password: env.USER_DB_PASSWORD],
                        [var: 'PRODUCT_DB_USERNAME', password: env.PRODUCT_DB_USERNAME],
                        [var: 'PRODUCT_DB_PASSWORD', password: env.PRODUCT_DB_PASSWORD],
                        [var: 'MEDIA_DB_USERNAME', password: env.MEDIA_DB_USERNAME],
                        [var: 'MEDIA_DB_PASSWORD', password: env.MEDIA_DB_PASSWORD],
                        [var: 'ORDER_DB_USERNAME', password: env.ORDER_DB_USERNAME],
                        [var: 'ORDER_DB_PASSWORD', password: env.ORDER_DB_PASSWORD]
                    ]

                    try {
                        // Use maskPasswords with named arguments
                        maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                            // Execute the deploy commands
                            sh '''
                            export USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME
                            export USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD
                            export PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME
                            export PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD
                            export MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME
                            export MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD
                            export ORDER_DB_CREDENTIALS_USERNAME=$ORDER_DB_USERNAME
                            export ORDER_DB_CREDENTIALS_PASSWORD=$ORDER_DB_PASSWORD

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker ps -aq | xargs -n 1 -I {} sh -c 'docker inspect --format="{{.State.Status}}" $1 | grep -q running && docker stop $1 || true' -- {}
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f --volumes

                            docker pull $USER_MICROSERVICE_IMAGE
                            docker pull $PRODUCT_MICROSERVICE_IMAGE
                            docker pull $MEDIA_MICROSERVICE_IMAGE
                            docker pull $ORDER_MICROSERVICE_IMAGE
                            docker pull $FRONTEND_IMAGE

                            docker-compose up -d
                            '''

                            def allContainersRunning = true
                            for (container in expectedContainers) {
                                def status = sh(script: "docker inspect --format='{{.State.Status}}' ${container}", returnStdout: true).trim()
                                if (status != 'running') {
                                    echo "Container ${container} is not running. Status: ${status}"
                                    allContainersRunning = false
                                    break
                                }
                            }

                            if (!allContainersRunning) {
                                error("Not all containers are running as expected.")
                            }
                            
                            sh '''
                            echo "Deployment passed. Executing backup."

                            docker save -o ~/user-microservice.tar $USER_MICROSERVICE_IMAGE
                            docker save -o ~/product-microservice.tar $PRODUCT_MICROSERVICE_IMAGE
                            docker save -o ~/media-microservice.tar $MEDIA_MICROSERVICE_IMAGE
                            docker save -o ~/order-microservice.tar $ORDER_MICROSERVICE_IMAGE
                            docker save -o ~/frontend.tar $FRONTEND_IMAGE

                            if [ ! -d "~/backup" ]; then
                                mkdir -p ~/backup
                            fi

                            mv ~/*.tar ~/backup/
                            '''
                        }
                    } catch (err) {
                        // Use maskPasswords with named arguments
                        maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                            // If deploy fails, the rollback commands are executed
                            sh '''
                            echo "Error: ${err.getMessage()}"
                            echo "Deployment failed. Executing rollback."
                            
                            export USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME
                            export USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD
                            export PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME
                            export PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD
                            export MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME
                            export MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD
                            export ORDER_DB_CREDENTIALS_USERNAME=$ORDER_DB_USERNAME
                            export ORDER_DB_CREDENTIALS_PASSWORD=$ORDER_DB_PASSWORD

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker ps -aq | xargs -n 1 -I {} sh -c 'docker inspect --format="{{.State.Status}}" $1 | grep -q running && docker stop $1 || true' -- {}
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f --volumes

                            cp ~/backup/*.tar ~/

                            docker load -i ~/user-microservice.tar
                            docker load -i ~/product-microservice.tar
                            docker load -i ~/media-microservice.tar
                            docker load -i ~/order-microservice.tar
                            docker load -i ~/frontend.tar

                            docker-compose up -d
                            '''
                        }

                        // Re-throw the error so that the pipeline fails
                        throw err
                    }
                }
            }
        }
    }

    post {
        always {
            echo "The pipeline has completed execution."
        }

        success {
            script {
                mail to: "${predefinedEmails}",
                    subject: "Jenkins Pipeline SUCCESS: ${currentBuild.fullDisplayName}",
                    body: """Hello,

The Jenkins Pipeline ${currentBuild.fullDisplayName} has succeeded.

See full details at: ${env.BUILD_URL}

Best regards,
Gritlab Jenkins
"""
            }
        }

        failure {
            script {
                def pipelineBreakers = currentBuild.changeSets.collectMany { changeSet ->
                    changeSet.items.collect { it.author.fullName }
                }.join(', ')
        
                def recipient = pipelineBreakers ? "${pipelineBreakers}, ${predefinedEmails}" : predefinedEmails
        
                mail to: recipient,
                    subject: "Jenkins Pipeline FAILURE: ${currentBuild.fullDisplayName}",
                    body: """Hello,

The Jenkins Pipeline ${currentBuild.fullDisplayName} has failed.

See full details at: ${env.BUILD_URL}

Best regards,
Gritlab Jenkins
"""
            }
        }
    }
}
