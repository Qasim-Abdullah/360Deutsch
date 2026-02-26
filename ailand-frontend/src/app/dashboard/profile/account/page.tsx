import { ContentSection } from '../../../../components/content-section'
import { AccountForm } from '../../../../components/ui/forms/account-form'
import { getProfileAction } from '@/app/actions/profile'

export default async function AccountPage() {
  const user = await getProfileAction()

  return (
    <ContentSection
      title='Account'
      desc=''
    >
      <AccountForm user={user} />
    </ContentSection>
  )
}
