def predefinedEmails = 'dang.lam@gritlab.ax'

// Define a function to cleanup Docker artifacts with a custom timeout that works on both macOS and Ubuntu
def cleanupDocker(timeoutSeconds) {
    sh(script: """
        set +e  # Disable exit on error
        set -x  # Enable verbose output

        ( 
            docker ps -aq | while read line; do if [ -n "$line" ]; then echo $line | xargs docker rm -f; fi; done
            docker images -aq | while read line; do if [ -n "$line" ]; then echo $line | xargs docker rmi -f; fi; done
            docker volume ls -q | while read line; do if [ -n "$line" ]; then echo $line | xargs docker volume rm; fi; done
            
            # List all networks, exclude default networks, and remove the rest if any exist
            docker network ls --format "{{.ID}} {{.Name}}" | grep -v -E "(bridge|host|none)" | while read line; do if [ -n "$line" ]; then echo $line | awk '{print $1}' | xargs docker network rm; fi; done
        ) & cleanup_pid=$!

        # macOS doesn't support the timeout command out-of-the-box, and sleep doesn't have the ability to send signals.
        # We use perl as a cross-platform alternative to the timeout command.
        perl -e 'alarm shift; exec @ARGV' "$timeoutSeconds" sh -c 'wait $cleanup_pid'
        cleanup_exit_code=$?

        if [ $cleanup_exit_code -eq 142 ]; then  # If exit code is 142, it means the timeout was reached
            echo "Cleanup process timed out after ${timeoutSeconds} seconds"
        fi

        set -e  # Re-enable exit on error
    """, returnStdout: true).trim()
}

pipeline {
    agent none // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    stages {
        stage('Build') {
            agent { label 'master' } // This stage will be executed on the 'master' agent
            steps {
                script {
                    cleanupDocker()  // Cleanup any Docker artifacts from previous builds

                    // Execute the build commands
                    sh '''
                    export DOCKER_DEFAULT_PLATFORM=linux/amd64
                    docker-compose build

                    docker tag buy-01-pipeline-user-microservice danglamgritlab/user-microservice:latest
                    docker push danglamgritlab/user-microservice:latest

                    docker tag buy-01-pipeline-product-microservice danglamgritlab/product-microservice:latest
                    docker push danglamgritlab/product-microservice:latest

                    docker tag buy-01-pipeline-media-microservice danglamgritlab/media-microservice:latest
                    docker push danglamgritlab/media-microservice:latest

                    docker tag buy-01-pipeline-frontend danglamgritlab/frontend:latest
                    docker push danglamgritlab/frontend:latest
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Using try-catch for the deploy and potential rollback
                    try {
                        cleanupDocker()  // Cleanup any Docker artifacts from previous builds

                        // Execute the deploy commands
                        sh '''
                        cd /mnt/myvolume
                        rm -rf *.tar

                        docker pull danglamgritlab/user-microservice:latest
                        docker pull danglamgritlab/product-microservice:latest
                        docker pull danglamgritlab/media-microservice:latest
                        docker pull danglamgritlab/frontend:latest

                        docker-compose up -d
                        '''
                    } catch (Exception e) {
                        cleanupDocker()  // Cleanup any Docker artifacts from previous builds

                        // If deploy fails, the rollback commands are executed
                        echo "Deployment failed. Executing rollback."
                        sh '''
                        cd /mnt/myvolume
                        rm -rf *.tar
                        cp backup/*.tar .

                        docker load -i user-microservice.tar
                        docker load -i product-microservice.tar
                        docker load -i media-microservice.tar
                        docker load -i frontend.tar

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
                cd /mnt/myvolume

                docker save -o user-microservice.tar danglamgritlab/user-microservice
                docker save -o product-microservice.tar danglamgritlab/product-microservice
                docker save -o media-microservice.tar danglamgritlab/media-microservice
                docker save -o frontend.tar danglamgritlab/frontend

                if [ ! -d "/mnt/myvolume/backup" ]; then
                    mkdir -p /mnt/myvolume/backup
                fi

                mv *.tar backup/
                '''
            }
        }

        failure {
            script {
                def culprits = currentBuild.changeSets.collectMany { changeSet ->
                    changeSet.items.collect { it.author.fullName }
                }.join(', ')
        
                def recipient = culprits ? "${culprits}, ${predefinedEmails}" : predefinedEmails
        
                mail to: recipient,
                    subject: "Jenkins Build FAILURE: ${currentBuild.fullDisplayName}",
                    body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
'''
    }
}

        changed {
            script {
                if (currentBuild.resultIsBetterOrEqualTo('SUCCESS') && currentBuild.previousBuild.resultIsWorseOrEqualTo('FAILURE')) {
                    mail to: "${predefinedEmails}",
                        subject: "Jenkins Build RECOVERED: ${currentBuild.fullDisplayName}",
                        body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has recovered from failure.

Best regards,
Gritlab Jenkins
'''
                }
            }
        }
    }
}
