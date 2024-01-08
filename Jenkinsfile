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
        NEXUS_DOCKER_REPOSITORY = '142.93.175.42:8083'
        NEXUS_SERVER = 'http://142.93.175.42:8081'
    }

    stages {
        stage('Setup Environment Variables') {
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
                        env.USER_MICROSERVICE_IMAGE = "${env.NEXUS_DOCKER_REPOSITORY}/user-microservice"
                        env.PRODUCT_MICROSERVICE_IMAGE = "${env.NEXUS_DOCKER_REPOSITORY}/product-microservice"
                        env.MEDIA_MICROSERVICE_IMAGE = "${env.NEXUS_DOCKER_REPOSITORY}/media-microservice"
                        env.ORDER_MICROSERVICE_IMAGE = "${env.NEXUS_DOCKER_REPOSITORY}/order-microservice"
                        env.FRONTEND_IMAGE = "${env.NEXUS_DOCKER_REPOSITORY}/frontend"
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

        stage("Quality Gate for Frontend") {
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
        }

        stage('Deploy JAR and POM Artifacts to Nexus') {
            agent { label 'build-agent' }
            steps {
                script {
                    sh '''
                    cd backend
                    mvn clean deploy -Drevision=1.0-${BUILD_NUMBER}-SNAPSHOT -DskipTests -Dnexus.server.url=${NEXUS_SERVER}
                    '''
                }
            }
        }

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
                        [var: 'NEXUS_USERNAME', password: env.NEXUS_USERNAME],
                        [var: 'NEXUS_PASSWORD', password: env.NEXUS_PASSWORD],
                        [var: 'JWT_SECRET_VALUE', password: env.JWT_SECRET_VALUE]
                    ]

                    // Use maskPasswords with named arguments
                    maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                        // Execute the build commands
                        sh '''
                        docker system prune -a -f --volumes

                        cd backend

                        docker build -t user-microservice:$BUILD_NUMBER -f user/Dockerfile \
                            --build-arg USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME \
                            --build-arg USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD \
                            --build-arg NEXUS_USERNAME=$NEXUS_USERNAME \
                            --build-arg NEXUS_PASSWORD=$NEXUS_PASSWORD \
                            --build-arg NEXUS_SERVER=$NEXUS_SERVER \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag user-microservice:$BUILD_NUMBER $USER_MICROSERVICE_IMAGE:$BUILD_NUMBER
                        docker push $USER_MICROSERVICE_IMAGE:$BUILD_NUMBER

                        docker build -t product-microservice:$BUILD_NUMBER -f product/Dockerfile \
                            --build-arg PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME \
                            --build-arg PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD \
                            --build-arg NEXUS_USERNAME=$NEXUS_USERNAME \
                            --build-arg NEXUS_PASSWORD=$NEXUS_PASSWORD \
                            --build-arg NEXUS_SERVER=$NEXUS_SERVER \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag product-microservice:$BUILD_NUMBER $PRODUCT_MICROSERVICE_IMAGE:$BUILD_NUMBER
                        docker push $PRODUCT_MICROSERVICE_IMAGE:$BUILD_NUMBER

                        docker build -t media-microservice:$BUILD_NUMBER -f media/Dockerfile \
                            --build-arg MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME \
                            --build-arg MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD \
                            --build-arg NEXUS_USERNAME=$NEXUS_USERNAME \
                            --build-arg NEXUS_PASSWORD=$NEXUS_PASSWORD \
                            --build-arg NEXUS_SERVER=$NEXUS_SERVER \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag media-microservice:$BUILD_NUMBER $MEDIA_MICROSERVICE_IMAGE:$BUILD_NUMBER
                        docker push $MEDIA_MICROSERVICE_IMAGE:$BUILD_NUMBER

                        docker build -t order-microservice:$BUILD_NUMBER -f order/Dockerfile \
                            --build-arg ORDER_DB_CREDENTIALS_USERNAME=$ORDER_DB_USERNAME \
                            --build-arg ORDER_DB_CREDENTIALS_PASSWORD=$ORDER_DB_PASSWORD \
                            --build-arg NEXUS_USERNAME=$NEXUS_USERNAME \
                            --build-arg NEXUS_PASSWORD=$NEXUS_PASSWORD \
                            --build-arg NEXUS_SERVER=$NEXUS_SERVER \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag order-microservice:$BUILD_NUMBER $ORDER_MICROSERVICE_IMAGE:$BUILD_NUMBER
                        docker push $ORDER_MICROSERVICE_IMAGE:$BUILD_NUMBER

                        cd ../frontend
                        docker build -t frontend:$BUILD_NUMBER .
                        docker tag frontend:$BUILD_NUMBER $FRONTEND_IMAGE:$BUILD_NUMBER
                        docker push $FRONTEND_IMAGE:$BUILD_NUMBER

                        docker system prune -a -f --volumes
                        '''
                    }
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
                            export NEXUS_DOCKER_REPOSITORY=$NEXUS_DOCKER_REPOSITORY
                            export VERSION_NUMBER=$BUILD_NUMBER

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker ps -aq | xargs -n 1 -I {} sh -c 'docker inspect --format="{{.State.Status}}" $1 | grep -q running && docker stop $1 || true' -- {}
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f --volumes

                            docker pull $USER_MICROSERVICE_IMAGE:$BUILD_NUMBER
                            docker pull $PRODUCT_MICROSERVICE_IMAGE:$BUILD_NUMBER
                            docker pull $MEDIA_MICROSERVICE_IMAGE:$BUILD_NUMBER
                            docker pull $ORDER_MICROSERVICE_IMAGE:$BUILD_NUMBER
                            docker pull $FRONTEND_IMAGE:$BUILD_NUMBER

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
                            echo "Deployment passed. Saving $BUILD_NUMBER to the version_number file."
                            echo $BUILD_NUMBER > ~/version_number
                            '''
                        }
                    } catch (err) {
                        // Use maskPasswords with named arguments
                        maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                            // If deploy fails, the rollback commands are executed
                            // Read version number from the version_number file
                            sh '''
                            echo "Deployment failed. Executing rollback commands."

                            SUCCESS_VERSION=$(cat ~/version_number)
                            echo "Rolling back to version $SUCCESS_VERSION"

                            export USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME
                            export USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD
                            export PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME
                            export PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD
                            export MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME
                            export MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD
                            export ORDER_DB_CREDENTIALS_USERNAME=$ORDER_DB_USERNAME
                            export ORDER_DB_CREDENTIALS_PASSWORD=$ORDER_DB_PASSWORD
                            export NEXUS_DOCKER_REPOSITORY=$NEXUS_DOCKER_REPOSITORY
                            export VERSION_NUMBER=$SUCCESS_VERSION

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker ps -aq | xargs -n 1 -I {} sh -c 'docker inspect --format="{{.State.Status}}" $1 | grep -q running && docker stop $1 || true' -- {}
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f --volumes

                            docker pull $USER_MICROSERVICE_IMAGE:$SUCCESS_VERSION
                            docker pull $PRODUCT_MICROSERVICE_IMAGE:$SUCCESS_VERSION
                            docker pull $MEDIA_MICROSERVICE_IMAGE:$SUCCESS_VERSION
                            docker pull $ORDER_MICROSERVICE_IMAGE:$SUCCESS_VERSION
                            docker pull $FRONTEND_IMAGE:$SUCCESS_VERSION

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
                            echo "Rollback passed. Re-throwing the error so that the pipeline fails."
                            '''

                            throw err
                        }
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
