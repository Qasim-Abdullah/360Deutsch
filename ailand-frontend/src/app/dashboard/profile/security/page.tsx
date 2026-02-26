import { ContentSection } from '../../../../components/content-section'
import SecurityForm from '../../../../components/ui/forms/security-form'  

function page() {
  return (
    <ContentSection
      title='Security'
      desc='Manage your password and account security.'
    >
      <SecurityForm />
    </ContentSection>
  )
}

export default page
