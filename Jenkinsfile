def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'

pipeline {
    agent any // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    stages {
        stage('Build') {
            agent { label 'build-agent' } // This stage will be executed on the 'build' agent
            steps {
                script {
                    // Execute the build commands
                    sh '''
                    docker system prune -f

                    cd backend

                    docker build -t user-microservice -f user/Dockerfile .
                    docker tag user-microservice danglamgritlab/user-microservice:latest
                    docker push danglamgritlab/user-microservice:latest

                    docker build -t product-microservice -f product/Dockerfile .
                    docker tag product-microservice danglamgritlab/product-microservice:latest
                    docker push danglamgritlab/product-microservice:latest

                    docker build -t media-microservice -f media/Dockerfile .
                    docker tag media-microservice danglamgritlab/media-microservice:latest
                    docker push danglamgritlab/media-microservice:latest

                    cd ../frontend
                    docker build -t frontend .
                    docker tag frontend danglamgritlab/frontend:latest
                    docker push danglamgritlab/frontend:latest
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy-agent' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Using try-catch for the deploy and potential rollback
                    try {
                        // Execute the deploy commands
                        sh '''
                        docker-compose down --remove-orphans
                        docker system prune -f

                        rm -rf ~/*.tar

                        docker pull danglamgritlab/user-microservice:latest
                        docker pull danglamgritlab/product-microservice:latest
                        docker pull danglamgritlab/media-microservice:latest
                        docker pull danglamgritlab/frontend:latest

                        docker-compose up -d
                        '''
                    } catch (Exception e) {
                        // If deploy fails, the rollback commands are executed
                        echo "Deployment failed. Executing rollback."
                        sh '''
                        docker-compose down --remove-orphans
                        docker system prune -f

                        rm -rf ~/*.tar
                        cp ~/backup/*.tar ~/

                        docker load -i ~/user-microservice.tar
                        docker load -i ~/product-microservice.tar
                        docker load -i ~/media-microservice.tar
                        docker load -i ~/frontend.tar

                        docker-compose up -d
                        '''
                        // Rethrow the exception to mark the pipeline as failed
                        throw e
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
                sh '''
                docker save -o ~/user-microservice.tar danglamgritlab/user-microservice
                docker save -o ~/product-microservice.tar danglamgritlab/product-microservice
                docker save -o ~/media-microservice.tar danglamgritlab/media-microservice
                docker save -o ~/frontend.tar danglamgritlab/frontend

                if [ ! -d "~/backup" ]; then
                    mkdir -p ~/backup
                fi

                mv ~/*.tar ~/backup/
                '''

                mail to: "${predefinedEmails}",
                        subject: "Jenkins Pipeline SUCCESS: ${currentBuild.fullDisplayName}",
                        body: """Hello,

The Jenkins build ${currentBuild.fullDisplayName} has succeeded.

Best regards,
Gritlab Jenkins
"""
            }
        }

        failure {
            script {
                def culprits = currentBuild.changeSets.collectMany { changeSet ->
                    changeSet.items.collect { it.author.fullName }
                }.join(', ')
        
                def recipient = culprits ? "${culprits}, ${predefinedEmails}" : predefinedEmails
        
                mail to: recipient,
                    subject: "Jenkins Pipeline FAILURE: ${currentBuild.fullDisplayName}",
                    body: """Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
"""
    }
}

        changed {
            script {
                if (currentBuild.resultIsBetterOrEqualTo('SUCCESS') && currentBuild.previousBuild.resultIsWorseOrEqualTo('FAILURE')) {
                    mail to: "${predefinedEmails}",
                        subject: "Jenkins Pipeline RECOVERED: ${currentBuild.fullDisplayName}",
                        body: """Hello,

The Jenkins build ${currentBuild.fullDisplayName} has recovered from failure.

Best regards,
Gritlab Jenkins
"""
                }
            }
        }
    }
}
